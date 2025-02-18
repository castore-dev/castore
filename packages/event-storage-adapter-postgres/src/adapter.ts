/* eslint-disable complexity */

/* eslint-disable max-lines */
import type { SerializableParameter } from 'postgres';
import postgres from 'postgres';

import { GroupedEvent } from '@castore/core';
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

import { PostgresEventAlreadyExistsError } from './error';

type AggregateId =
  | {
      type: 'UUID' | 'ULID';
    }
  | {
      type: 'VARCHAR';
      length: number;
    };

const assertIsSerializableParameter: (
  value: unknown,
) => asserts value is SerializableParameter = value => {
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
  private _sql: postgres.Sql<{ bigint: bigint }>;
  private _tableName: string;

  constructor({
    connectionString = 'postgresql://postgres:postgres@localhost:5432/postgres',
    tableName = 'event',
  }: {
    connectionString?: string;
    tableName?: string;
  } = {}) {
    this._tableName = tableName;
    this._sql = PostgresEventStorageAdapter.createClient({
      connectionString,
    });
  }

  private static createClient({
    connectionString,
  }: {
    connectionString: string;
  }): postgres.Sql<{ bigint: bigint }> {
    return postgres(connectionString, {
      types: { bigint: postgres.BigInt },
      onnotice: notice => {
        // simple notice of already existing table, index, relation
        if (notice.severity === 'NOTICE') {
          return;
        }
        console.log(notice);
      },
    });
  }

  //TODO do all that in a single transaction
  static async createEventTable({
    connectionString = 'postgresql://postgres:postgres@localhost:5432/postgres',
    tableName = 'event',
    idType = 'BIGSERIAL',
    aggregateNameLength = 32,
    aggregateId = {
      type: 'UUID',
    },
    versionType = 'BIGINT',
    typeLength = 64,
  }: {
    connectionString?: string;
    tableName?: string;
    idType?: 'BIGSERIAL' | 'SERIAL';
    aggregateNameLength?: number;
    aggregateId?: AggregateId;
    versionType?: 'BIGINT' | 'INTEGER';
    typeLength?: number;
  } = {}): Promise<{ tableName: string }> {
    const sql = PostgresEventStorageAdapter.createClient({
      connectionString,
    });
    const aggregateIdType =
      aggregateId.type === 'VARCHAR'
        ? sql.unsafe(`VARCHAR(${aggregateId.length})`)
        : sql.unsafe(aggregateId.type);

    await sql`
      CREATE TABLE IF NOT EXISTS ${sql.unsafe(tableName)} (
        id              ${sql.unsafe(idType)} PRIMARY KEY,
        aggregate_name  ${sql.unsafe(
          `VARCHAR(${aggregateNameLength})`,
        )} NOT NULL,
        aggregate_id    ${aggregateIdType} NOT NULL,
        version         ${sql.unsafe(versionType)} NOT NULL,
        type            ${sql.unsafe(`VARCHAR(${typeLength})`)} NOT NULL,
        data            JSONB,
        metadata        JSONB,
        timestamp       TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP(3)),
        UNIQUE (aggregate_name, aggregate_id, version)
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_event_aggregate_name 
      ON ${sql.unsafe(tableName)}(aggregate_name);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_event_version
      ON ${sql.unsafe(tableName)}(version);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_event_aggregate_lookup
      ON ${sql.unsafe(tableName)}(aggregate_name, aggregate_id);
    `;

    await sql.end();

    return { tableName };
  }

  static async dropEventTable({
    connectionString = 'postgresql://postgres:postgres@localhost:5432/postgres',
    tableName = 'event',
  }: {
    connectionString?: string;
    tableName?: string;
  }): Promise<void> {
    const sql = PostgresEventStorageAdapter.createClient({
      connectionString,
    });

    await sql`
      DROP TABLE IF EXISTS ${sql.unsafe(tableName)};
    `;

    await sql.end();
  }

  private toEventDetail(event: postgres.Row) {
    const eventDetail = {
      aggregateId: event.aggregate_id as string,
      version: Number(event.version),
      type: event.type as string,
      payload: event.data as unknown | null,
      metadata: event.metadata as unknown | null,
      timestamp: (event.timestamp as Date).toISOString(),
    };
    if (!eventDetail.payload) delete eventDetail.payload;
    if (!eventDetail.metadata) delete eventDetail.metadata;

    return eventDetail as EventDetail;
  }

  async pushEvent(
    eventDetail: OptionalTimestamp<EventDetail>,
    options: PushEventOptions,
  ): Promise<{ event: EventDetail }> {
    const { aggregateId, version, type, payload, metadata, timestamp } =
      eventDetail;
    if (payload) assertIsSerializableParameter(payload);
    if (metadata) assertIsSerializableParameter(metadata);

    const onForced = () => this._sql`
    	ON CONFLICT (aggregate_name, aggregate_id, version)
      DO UPDATE SET
        type = EXCLUDED.type,
        data = EXCLUDED.data,
        metadata = EXCLUDED.metadata,
        timestamp = ${
          timestamp
            ? this._sql`EXCLUDED.timestamp`
            : this._sql`CURRENT_TIMESTAMP(3)`
        }
		`;

    const payloadValue = (payload as SerializableParameter) ?? null;
    const metadataValue = (metadata as SerializableParameter) ?? null;

    const INSERT = timestamp
      ? this._sql`
          INSERT INTO ${this._sql.unsafe(
            this._tableName,
          )} (aggregate_name, aggregate_id, version, type, data, metadata, timestamp)
        `
      : this._sql`
          INSERT INTO ${this._sql.unsafe(
            this._tableName,
          )} (aggregate_name, aggregate_id, version, type, data, metadata)
        `;

    const VALUES = timestamp
      ? this._sql`
          VALUES (${options.eventStoreId}, ${aggregateId}, ${version}, ${type}, ${payloadValue}, ${metadataValue}, ${timestamp})
        `
      : this._sql`
          VALUES (${options.eventStoreId}, ${aggregateId}, ${version}, ${type}, ${payloadValue}, ${metadataValue})
        `;

    const query = this._sql`
      ${INSERT}
      ${VALUES}
      ${options.force ? onForced() : this._sql``}
      RETURNING *
    `;

    const res = await query.catch(err => {
      if (
        err.code === '23505' &&
        err.message.includes(
          `${this._tableName}_aggregate_name_aggregate_id_version_key`,
        )
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

    if (!insertedEvent) {
      throw new Error('Failed to insert event');
    }

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
      ? this._sql`ORDER BY version DESC`
      : this._sql`ORDER BY version ASC`;
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
      FROM ${this._sql.unsafe(this._tableName)}
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

    const hasABadAdapter = allEvents.some(groupedEvent => {
      if (
        !(
          groupedEvent.eventStorageAdapter instanceof
          PostgresEventStorageAdapter
        )
      )
        return true;

      return false;
    });

    if (hasABadAdapter) {
      throw new Error(
        'All events must be connected to a PostgresEventStorageAdapter',
      );
    }

    await this._sql.begin(async transaction => {
      for (const groupedEvent of allEvents) {
        const eventDetail = groupedEvent.event;
        const { aggregateId, version, type, payload, metadata, timestamp } =
          eventDetail;

        const aggregateName =
          groupedEvent.eventStore?.eventStoreId ??
          groupedEvent.context?.eventStoreId;

        if (!aggregateName) {
          throw new Error('Event store ID (Aggregate name) is required');
        }

        if (payload) assertIsSerializableParameter(payload);
        if (metadata) assertIsSerializableParameter(metadata);

        const payloadValue = (payload as SerializableParameter) ?? null;
        const metadataValue = (metadata as SerializableParameter) ?? null;

        const onForced = () => transaction`
          ON CONFLICT (aggregate_name, aggregate_id, version)
          DO UPDATE SET
            type = EXCLUDED.type,
            data = EXCLUDED.data,
            metadata = EXCLUDED.metadata,
            timestamp = ${
              timestamp
                ? transaction`EXCLUDED.timestamp`
                : transaction`CURRENT_TIMESTAMP(3)`
            }
        `;

        const INSERT = timestamp
          ? transaction`
          INSERT INTO ${this._sql.unsafe(
            this._tableName,
          )} (aggregate_name, aggregate_id, version, type, data, metadata, timestamp)
        `
          : transaction`
          INSERT INTO ${this._sql.unsafe(
            this._tableName,
          )} (aggregate_name, aggregate_id, version, type, data, metadata)
        `;

        const VALUES = timestamp
          ? transaction`
          VALUES (${aggregateName}, ${aggregateId}, ${version}, ${type}, ${payloadValue}, ${metadataValue}, ${timestamp})
        `
          : transaction`
          VALUES (${aggregateName}, ${aggregateId}, ${version}, ${type}, ${payloadValue}, ${metadataValue})
        `;

        const query = transaction`
          ${INSERT}
          ${VALUES}
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
              eventStoreId: aggregateName,
              aggregateId,
              version,
            });
          }
          throw err;
        });

        const insertedEvent = res[0];

        if (!insertedEvent) {
          throw new Error('Failed to insert event');
        }

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
        FROM ${this._sql.unsafe(this._tableName)}
        WHERE aggregate_name = ${context.eventStoreId}
        AND version = 1
        ${initialEventAfterFilter}
        ${initialEventBeforeFilter}
				${filterRemainingCount()}
      )
      SELECT e.id, e.aggregate_id, e.timestamp, ac.remaining_count
      FROM ${this._sql.unsafe(this._tableName)} e, aggregate_count ac
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
    const aggregateIds = results.map(({ aggregate_id, timestamp }) => ({
      aggregateId: aggregate_id as string,
      initialEventTimestamp: timestamp.toISOString(),
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
