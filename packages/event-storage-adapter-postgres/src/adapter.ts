/* eslint-disable max-lines */
import type { SerializableParameter } from 'postgres';
import postgres from 'postgres';

import type {
  EventDetail,
  EventsQueryOptions,
  EventStorageAdapter,
  EventStoreContext,
  ListAggregateIdsOptions,
  ListAggregateIdsOutput,
  OptionalTimestamp,
  PushEventOptions,
} from '@castore/core';
import { GroupedEvent } from '@castore/core';

import { PostgresEventAlreadyExistsError } from './error';

const assertIsSerializableParameter = (
  value: unknown,
): asserts value is SerializableParameter => {
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  if (!value) {
    throw new Error(`Payload is required`);
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Payload must be a plain object`);
  }
};

export type ParsedPageToken = {
  limit?: number;
  initialEventAfter?: string | undefined;
  initialEventBefore?: string | undefined;
  reverse?: boolean | undefined;
  lastEvaluatedKey?:
    | {
        aggregateId: string;
        initialEventTimestamp: string;
      }
    | undefined;
};

export class PostgresEventStorageAdapter implements EventStorageAdapter {
  private _sql: postgres.Sql<{}>;

  constructor(
    payload: { connectionString: string } = {
      connectionString:
        'postgresql://postgres:postgres@localhost:5432/postgres',
    },
  ) {
    this._sql = postgres(payload.connectionString, {
      types: {
        bigint: postgres.BigInt,
      },
      // debug: (connection: number, query: string, parameters: unknown[], paramTypes: unknown[]) => {
      //   console.log('Query:', query);
      //   console.log('Parameters:', parameters);
      // },
    });
  }

  //TODO do all that in a single transaction
  //TODO catch NOTICE errors
  async createEventTable() {
    await this._sql`
      CREATE TABLE IF NOT EXISTS event (
        id              BIGSERIAL PRIMARY KEY,
        aggregate_name  VARCHAR(32) NOT NULL,
        aggregate_id    UUID NOT NULL,
        version         BIGINT NOT NULL,
        type            VARCHAR(64) NOT NULL,
        data            JSONB NOT NULL,
        metadata        JSONB,
        timestamp       TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
        UNIQUE (aggregate_name, aggregate_id, version)
      );
    `;

    await this._sql`
      CREATE INDEX IF NOT EXISTS idx_event_aggregate_name 
      ON event(aggregate_name);
    `;

    await this._sql`
      CREATE INDEX IF NOT EXISTS idx_event_version
      ON event(version);
    `;

    await this._sql`
      CREATE INDEX IF NOT EXISTS idx_event_aggregate_lookup
      ON event(aggregate_name, aggregate_id);
    `;
  }

  private toEventDetail(event: postgres.Row) {
    return {
      aggregateId: event.aggregate_id as string,
      version: Number(event.version),
      type: event.type as string,
      payload: event.data as unknown,
      metadata: event.metadata as unknown | null,
      timestamp: event.timestamp.toISOString() as string,
    };
  }

  async pushEvent(
    eventDetail: OptionalTimestamp<EventDetail>,
    options: PushEventOptions,
  ): Promise<{ event: EventDetail }> {
    const { aggregateId, version, type, payload, metadata } = eventDetail;
    assertIsSerializableParameter(payload);
    if (metadata) {
      assertIsSerializableParameter(metadata);
    }

    const onForced = () => this._sql`
    	ON CONFLICT (aggregate_name, aggregate_id, version)
      DO UPDATE SET
        type = EXCLUDED.type,
        data = EXCLUDED.data,
        metadata = EXCLUDED.metadata,
        timestamp = CURRENT_TIMESTAMP(3)
		`;

    const query = this._sql`
      INSERT INTO event (aggregate_name, aggregate_id, version, type, data, metadata)
      VALUES (
        ${options.eventStoreId},
        ${aggregateId},
        ${version},
        ${type},
        ${payload},
        ${(metadata as SerializableParameter) ?? null}
      )
      ${options.force ? onForced() : this._sql``}
      RETURNING *
    `;

    const res = await query.catch(err => {
      if (
        err.code === '23505' &&
        err.message.includes('event_aggregate_name_aggregate_id_version_key')
      ) {
        throw new PostgresEventAlreadyExistsError({
          eventStoreId: options.eventStoreId,
          aggregateId,
          version,
        });
      }
      throw err;
    });

    const insertedEvent = res[0];

    return {
      event: this.toEventDetail(insertedEvent),
    };
  }

  async getEvents(
    aggregateId: string,
    context: EventStoreContext,
    options?: EventsQueryOptions,
  ): Promise<{ events: EventDetail[] }> {
    const order = options?.reverse
      ? this._sql`ORDER BY timestamp DESC`
      : this._sql`ORDER BY timestamp ASC`;
    const limit = options?.limit
      ? this._sql`LIMIT ${options.limit}`
      : this._sql``;
    const minVersion = options?.minVersion
      ? this._sql`AND version >= ${options.minVersion}`
      : this._sql``;
    const maxVersion = options?.maxVersion
      ? this._sql`AND version <= ${options.maxVersion}`
      : this._sql``;

    const query = this._sql`
      SELECT aggregate_id, version, type, data, metadata, timestamp 
      FROM event
      WHERE aggregate_id = ${aggregateId}
      AND aggregate_name = ${context.eventStoreId}
      ${minVersion}
      ${maxVersion}
      ${order}
      ${limit}
    `;

    const events = await query;

    return {
      events: events.map(event => this.toEventDetail(event)),
    };
  }
  async pushEventGroup(
    options: { force?: boolean },
    groupedEvents_0: GroupedEvent<{
      payload?: unknown;
      metadata?: unknown;
      type: string;
      aggregateId: string;
      version: number;
      timestamp: string;
    }>,
    ...groupedEvents: GroupedEvent<{
      payload?: unknown;
      metadata?: unknown;
      type: string;
      aggregateId: string;
      version: number;
      timestamp: string;
    }>[]
  ): Promise<{ eventGroup: { event: EventDetail }[] }> {
    const allEvents = [groupedEvents_0, ...groupedEvents];
    const results: { event: EventDetail }[] = [];

    await this._sql.begin(async transaction => {
      for (const groupedEvent of allEvents) {
        const eventDetail = groupedEvent.event;
        const { aggregateId, version, type, payload, metadata } = eventDetail;
        if (!groupedEvent.eventStore || !groupedEvent.eventStore.eventStoreId) {
          throw new Error('Event store ID (Aggregate name) is required');
        }

        assertIsSerializableParameter(payload);
        if (metadata) {
          assertIsSerializableParameter(metadata);
        }

        const onForced = () => transaction`
          ON CONFLICT (aggregate_name, aggregate_id, version)
          DO UPDATE SET
            type = EXCLUDED.type,
            data = EXCLUDED.data,
            metadata = EXCLUDED.metadata,
            timestamp = CURRENT_TIMESTAMP(3)
        `;

        const query = transaction`
          INSERT INTO event (aggregate_name, aggregate_id, version, type, data, metadata)
          VALUES (
            ${groupedEvent.eventStore.eventStoreId ?? 'default'},
            ${aggregateId},
            ${version},
            ${type},
            ${payload},
            ${(metadata as SerializableParameter) ?? null}
          )
          ${options.force ? onForced() : transaction``}
          RETURNING *
        `;

        const res = await query.catch(err => {
          if (
            err.code === '23505' &&
            err.message.includes(
              'event_aggregate_name_aggregate_id_version_key',
            )
          ) {
            throw new PostgresEventAlreadyExistsError({
              eventStoreId: groupedEvent.eventStore?.eventStoreId ?? 'default',
              aggregateId,
              version,
            });
          }
          throw err;
        });

        const insertedEvent = res[0];
        results.push({ event: this.toEventDetail(insertedEvent) });
      }
    });

    return { eventGroup: results };
  }

  groupEvent(eventDetail: OptionalTimestamp<EventDetail>): GroupedEvent {
    return new GroupedEvent({ event: eventDetail, eventStorageAdapter: this });
  }

  private parseInputs({
    inputOptions,
  }: {
    inputOptions: ListAggregateIdsOptions | undefined;
  }) {
    let pageTokenParsed: ParsedPageToken = {};

    if (typeof inputOptions?.pageToken === 'string') {
      try {
        pageTokenParsed = JSON.parse(inputOptions.pageToken) as ParsedPageToken;
      } catch (error) {
        throw new Error('Invalid page token');
      }
    }

    return {
      limit: pageTokenParsed.limit ?? inputOptions?.limit,
      initialEventAfter:
        pageTokenParsed.initialEventAfter ?? inputOptions?.initialEventAfter,
      initialEventBefore:
        pageTokenParsed.initialEventBefore ?? inputOptions?.initialEventBefore,
      reverse: pageTokenParsed.reverse ?? inputOptions?.reverse,
      lastEvaluatedKey: pageTokenParsed.lastEvaluatedKey,
    };
  }

  async listAggregateIds(
    context: EventStoreContext,
    options?: ListAggregateIdsOptions,
  ): Promise<ListAggregateIdsOutput> {
    const {
      limit,
      initialEventAfter,
      initialEventBefore,
      reverse,
      lastEvaluatedKey,
    } = this.parseInputs({
      inputOptions: options,
    });

    const limitFilter = limit ? this._sql`LIMIT ${limit}` : this._sql``;
    const orderFilter = reverse
      ? this._sql`ORDER BY timestamp DESC`
      : this._sql`ORDER BY timestamp ASC`;
    const initialEventAfterFilter = initialEventAfter
      ? this._sql`AND timestamp > ${initialEventAfter}`
      : this._sql``;
    const initialEventBeforeFilter = initialEventBefore
      ? this._sql`AND timestamp < ${initialEventBefore}`
      : this._sql``;

    const filterRemainingCount = () => {
      if (lastEvaluatedKey?.initialEventTimestamp) {
        return reverse
          ? this._sql`AND timestamp < ${lastEvaluatedKey.initialEventTimestamp}`
          : this
              ._sql`AND timestamp > ${lastEvaluatedKey.initialEventTimestamp}`;
      }

      return this._sql``;
    };

    const filterCurrentPage = () => {
      if (lastEvaluatedKey?.initialEventTimestamp) {
        return reverse
          ? this._sql`AND timestamp < ${lastEvaluatedKey.initialEventTimestamp}`
          : this
              ._sql`AND timestamp > ${lastEvaluatedKey.initialEventTimestamp}`;
      }

      return this._sql``;
    };

    const query = this._sql`
      WITH aggregate_count AS (
        SELECT COUNT(*) as remaining_count 
        FROM event
        WHERE aggregate_name = ${context.eventStoreId}
        AND version = 1
        ${initialEventAfterFilter}
        ${initialEventBeforeFilter}
				${filterRemainingCount()}
      )
      SELECT e.id, e.aggregate_id, e.timestamp, ac.remaining_count
      FROM event e, aggregate_count ac
      WHERE e.aggregate_name = ${context.eventStoreId}
      AND e.version = 1
      ${initialEventAfterFilter}
      ${initialEventBeforeFilter}
			${filterCurrentPage()}
      ${orderFilter}
      ${limitFilter}
    `;

    const results = await query;
    const remainingCount = results[0]?.remaining_count
      ? Number(results[0].remaining_count)
      : 0;
    const aggregateIds = results.map(({ id, aggregate_id, timestamp }) => ({
      aggregateId: aggregate_id as string,
      initialEventTimestamp: timestamp,
    }));

    const hasNextPage = limit === undefined ? false : remainingCount > limit;

    const parsedNextPageToken: ParsedPageToken = {
      limit: options?.limit,
      initialEventAfter: options?.initialEventAfter,
      initialEventBefore: options?.initialEventBefore,
      reverse: options?.reverse,
      lastEvaluatedKey: aggregateIds.at(-1),
    };

    return {
      aggregateIds,
      ...(hasNextPage
        ? { nextPageToken: JSON.stringify(parsedNextPageToken) }
        : {}),
    };
  }
}
