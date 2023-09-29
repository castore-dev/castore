/* eslint-disable max-lines */
import {
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  AttributeValue,
  DynamoDBClient,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

import type {
  Aggregate,
  EventDetail,
  EventStorageAdapter,
  PushEventOptions,
} from '@castore/core';
import { GroupedEvent } from '@castore/core';

import {
  EVENT_TABLE_EVENT_STORE_ID_KEY,
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
  EVENT_TABLE_PK,
  EVENT_TABLE_SK,
  EVENT_TABLE_TIMESTAMP_KEY,
  MARSHALL_OPTIONS,
} from './constants';
import { DynamoDBEventAlreadyExistsError } from './error';
import { isConditionalCheckFailedException } from './utils/isConditionalCheckFailed';
import { isTransactionCancelledBecauseOfConditionalCheckFailed } from './utils/isTransactionCancelledBecauseOfConditionalCheckFailed';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from './utils/parseAppliedListAggregateIdsOptions';

const prefixAggregateId = (eventStoreId: string, aggregateId: string): string =>
  `${eventStoreId}#${aggregateId}`;

const unprefixAggregateId = (
  eventStoreId: string,
  aggregateId: string,
): string =>
  aggregateId.startsWith(`${eventStoreId}#`)
    ? aggregateId.slice(eventStoreId.length + 1)
    : aggregateId;

type DynamoDBSingleTableGroupedEvent<
  EVENT_DETAILS extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> = GroupedEvent<EVENT_DETAILS, AGGREGATE> & {
  eventStorageAdapter: DynamoDBSingleTableEventStorageAdapter;
};

const hasDynamoDBSingleTableEventStorageAdapter = (
  groupedEvent: GroupedEvent,
): groupedEvent is DynamoDBSingleTableGroupedEvent =>
  groupedEvent.eventStorageAdapter instanceof
  DynamoDBSingleTableEventStorageAdapter;

const hasContext = (
  groupedEvent: GroupedEvent,
): groupedEvent is GroupedEvent & {
  context: NonNullable<GroupedEvent['context']>;
} => groupedEvent.context !== undefined;

type ParsedGroupedEvent = DynamoDBSingleTableGroupedEvent & {
  context: NonNullable<GroupedEvent['context']>;
};

const parseGroupedEvents = (
  ...groupedEventsInput: [GroupedEvent, ...GroupedEvent[]]
): {
  groupedEvents: [ParsedGroupedEvent, ...ParsedGroupedEvent[]];
  timestamp?: string;
} => {
  let timestampInfos:
    | { timestamp: string; groupedEventIndex: number }
    | undefined;
  const groupedEvents: ParsedGroupedEvent[] = [];

  groupedEventsInput.forEach((groupedEvent, groupedEventIndex) => {
    if (!hasDynamoDBSingleTableEventStorageAdapter(groupedEvent)) {
      throw new Error(
        `Event group event #${groupedEventIndex} is not connected to a DynamoDBEventStorageAdapter`,
      );
    }

    if (!hasContext(groupedEvent)) {
      throw new Error(`Event group event #${groupedEventIndex} misses context`);
    }

    if (
      groupedEvent.event.timestamp !== undefined &&
      timestampInfos !== undefined
    ) {
      timestampInfos = {
        timestamp: groupedEvent.event.timestamp,
        groupedEventIndex,
      };
    }

    groupedEvents.push(groupedEvent);
  });

  if (timestampInfos !== undefined) {
    /**
     * @debt type "strangely, a second const is needed to keep the type as defined in forEach loop"
     */
    const _timestampInfos = timestampInfos;
    groupedEvents.forEach((groupedEvent, groupedEventIndex) => {
      if (groupedEvent.event.timestamp === undefined) {
        groupedEvent.event.timestamp = _timestampInfos.timestamp;
      } else if (groupedEvent.event.timestamp !== _timestampInfos.timestamp) {
        throw new Error(
          `Event group events #${groupedEventIndex} and #${_timestampInfos.groupedEventIndex} have different timestamps`,
        );
      }
    });
  }

  return {
    groupedEvents: groupedEvents as [
      ParsedGroupedEvent,
      ...ParsedGroupedEvent[],
    ],
    ...(timestampInfos !== undefined
      ? { timestamp: timestampInfos.timestamp }
      : {}),
  };
};

export class DynamoDBSingleTableEventStorageAdapter
  implements EventStorageAdapter
{
  getEvents: EventStorageAdapter['getEvents'];
  getPushEventInput: (
    eventDetail: EventDetail,
    options: PushEventOptions,
  ) => PutItemCommandInput;
  pushEvent: EventStorageAdapter['pushEvent'];
  pushEventGroup: EventStorageAdapter['pushEventGroup'];
  groupEvent: EventStorageAdapter['groupEvent'];
  listAggregateIds: EventStorageAdapter['listAggregateIds'];

  putSnapshot: EventStorageAdapter['putSnapshot'];
  getLastSnapshot: EventStorageAdapter['getLastSnapshot'];
  listSnapshots: EventStorageAdapter['listSnapshots'];

  getTableName: () => string;
  tableName: string | (() => string);
  dynamoDBClient: DynamoDBClient;

  constructor({
    tableName,
    dynamoDBClient,
  }: {
    tableName: string | (() => string);
    dynamoDBClient: DynamoDBClient;
  }) {
    this.tableName = tableName;
    this.dynamoDBClient = dynamoDBClient;

    this.getTableName = () =>
      typeof this.tableName === 'string' ? this.tableName : this.tableName();

    // eslint-disable-next-line complexity
    this.getEvents = async (
      aggregateId,
      { eventStoreId },
      { minVersion, maxVersion, reverse, limit } = {},
    ) => {
      const marshalledEvents: Record<string, AttributeValue>[] = [];

      const eventsQueryCommand = new QueryCommand({
        TableName: this.getTableName(),
        KeyConditionExpression:
          maxVersion !== undefined
            ? minVersion !== undefined
              ? '#aggregateId = :aggregateId and #version between :minVersion and :maxVersion'
              : '#aggregateId = :aggregateId and #version <= :maxVersion'
            : minVersion !== undefined
            ? '#aggregateId = :aggregateId and #version >= :minVersion'
            : '#aggregateId = :aggregateId',
        ExpressionAttributeNames: {
          '#aggregateId': EVENT_TABLE_PK,
          ...(maxVersion !== undefined || minVersion !== undefined
            ? { '#version': EVENT_TABLE_SK }
            : {}),
        },
        ExpressionAttributeValues: marshall(
          {
            ':aggregateId': prefixAggregateId(eventStoreId, aggregateId),
            ...(maxVersion !== undefined ? { ':maxVersion': maxVersion } : {}),
            ...(minVersion !== undefined ? { ':minVersion': minVersion } : {}),
          },
          MARSHALL_OPTIONS,
        ),
        ConsistentRead: true,
        ...(reverse !== undefined ? { ScanIndexForward: !reverse } : {}),
        ...(limit !== undefined ? { Limit: limit } : {}),
      });

      let eventsQueryResult = await this.dynamoDBClient.send(
        eventsQueryCommand,
      );
      marshalledEvents.push(...(eventsQueryResult.Items ?? []));

      while (eventsQueryResult.LastEvaluatedKey !== undefined) {
        eventsQueryCommand.input.ExclusiveStartKey =
          eventsQueryResult.LastEvaluatedKey;
        eventsQueryResult = await this.dynamoDBClient.send(eventsQueryCommand);

        marshalledEvents.push(...(eventsQueryResult.Items ?? []));
      }

      return {
        events: marshalledEvents
          .map(item => unmarshall(item))
          .map((item): EventDetail => {
            const {
              aggregateId: evtAggregateId,
              version,
              type,
              timestamp,
              payload,
              metadata,
            } = item as EventDetail;

            return {
              aggregateId: unprefixAggregateId(eventStoreId, evtAggregateId),
              version,
              type,
              timestamp,
              ...(payload !== undefined ? { payload } : {}),
              ...(metadata !== undefined ? { metadata } : {}),
            };
          }),
      };
    };

    this.getPushEventInput = (event, options) => {
      const { aggregateId, version, type, timestamp, payload, metadata } =
        event;
      const { eventStoreId, force = false } = options;

      return {
        TableName: this.getTableName(),
        Item: marshall(
          {
            aggregateId: prefixAggregateId(eventStoreId, aggregateId),
            version,
            type,
            timestamp,
            ...(payload !== undefined ? { payload } : {}),
            ...(metadata !== undefined ? { metadata } : {}),
            ...(version === 1 ? { eventStoreId } : {}),
          },
          MARSHALL_OPTIONS,
        ),
        ...(force
          ? {}
          : {
              ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
              ConditionExpression: 'attribute_not_exists(#version)',
            }),
      };
    };

    this.pushEvent = async (eventWithOptTimestamp, options) => {
      const event = {
        timestamp: new Date().toISOString(),
        ...eventWithOptTimestamp,
      };

      const putEventCommand = new PutItemCommand(
        this.getPushEventInput(event, options),
      );

      const { aggregateId, version } = event;

      try {
        await this.dynamoDBClient.send(putEventCommand);
      } catch (error) {
        if (
          error instanceof Error &&
          isConditionalCheckFailedException(error)
        ) {
          const { eventStoreId } = options;

          throw new DynamoDBEventAlreadyExistsError({
            eventStoreId,
            aggregateId,
            version,
          });
        }

        throw error;
      }

      return { event };
    };

    /**
     * @debt test "Add  unit test for pushEventGroup"
     */
    this.pushEventGroup = async (...groupedEventsInput) => {
      const { groupedEvents, timestamp = new Date().toISOString() } =
        parseGroupedEvents(...groupedEventsInput);

      const [firstGroupedEvent] = groupedEvents;
      const dynamodbClient =
        firstGroupedEvent.eventStorageAdapter.dynamoDBClient;

      try {
        await dynamodbClient.send(
          new TransactWriteItemsCommand({
            TransactItems: groupedEvents.map(groupedEvent => ({
              Put: groupedEvent.eventStorageAdapter.getPushEventInput(
                { timestamp, ...groupedEvent.event },
                groupedEvent.context,
              ),
            })),
          }),
        );
      } catch (error) {
        if (isTransactionCancelledBecauseOfConditionalCheckFailed(error)) {
          /**
           * @debt feature "Detect which event caused the error within the event group"
           */
          throw new DynamoDBEventAlreadyExistsError({
            aggregateId: '???',
            version: NaN,
            eventStoreId: '???',
          });
        }

        throw error;
      }

      return {
        eventGroup: groupedEvents.map(({ event }) => ({
          event: { timestamp, ...event },
        })),
      };
    };

    this.groupEvent = event =>
      new GroupedEvent({ event, eventStorageAdapter: this });

    // eslint-disable-next-line complexity
    this.listAggregateIds = async (
      { eventStoreId },
      { pageToken: inputPageToken, ...inputOptions } = {},
    ) => {
      const aggregateIdsQueryCommandInput: QueryCommandInput = {
        TableName: this.getTableName(),
        KeyConditionExpression: '#eventStoreId = :eventStoreId',
        ExpressionAttributeNames: {
          '#eventStoreId': EVENT_TABLE_EVENT_STORE_ID_KEY,
        },
        ExpressionAttributeValues: marshall(
          { ':eventStoreId': eventStoreId },
          MARSHALL_OPTIONS,
        ),
        IndexName: EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
      };

      const {
        limit,
        initialEventAfter,
        initialEventBefore,
        reverse,
        exclusiveStartKey,
      } = parseAppliedListAggregateIdsOptions({ inputPageToken, inputOptions });

      if (limit !== undefined) {
        aggregateIdsQueryCommandInput.Limit = limit;
      }

      if (initialEventBefore !== undefined || initialEventAfter !== undefined) {
        aggregateIdsQueryCommandInput.KeyConditionExpression =
          initialEventBefore !== undefined
            ? initialEventAfter !== undefined
              ? '#eventStoreId = :eventStoreId and #timestamp between :initialEventAfter and :initialEventBefore'
              : '#eventStoreId = :eventStoreId and #timestamp <= :initialEventBefore'
            : initialEventAfter !== undefined
            ? '#eventStoreId = :eventStoreId and #timestamp >= :initialEventAfter'
            : '#eventStoreId = :eventStoreId';

        aggregateIdsQueryCommandInput.ExpressionAttributeNames = {
          ...aggregateIdsQueryCommandInput.ExpressionAttributeNames,
          ['#timestamp']: EVENT_TABLE_TIMESTAMP_KEY,
        };

        aggregateIdsQueryCommandInput.ExpressionAttributeValues = {
          ...aggregateIdsQueryCommandInput.ExpressionAttributeValues,
          ...marshall(
            {
              ...(initialEventBefore !== undefined
                ? { ':initialEventBefore': initialEventBefore }
                : {}),
              ...(initialEventAfter !== undefined
                ? { ':initialEventAfter': initialEventAfter }
                : {}),
            },
            MARSHALL_OPTIONS,
          ),
        };
      }

      if (reverse !== undefined) {
        aggregateIdsQueryCommandInput.ScanIndexForward = !reverse;
      }

      if (exclusiveStartKey !== undefined) {
        aggregateIdsQueryCommandInput.ExclusiveStartKey = exclusiveStartKey;
      }

      const {
        Items: unmarshalledInitialEvents = [],
        LastEvaluatedKey: lastEvaluatedKey,
      } = await this.dynamoDBClient.send(
        new QueryCommand(aggregateIdsQueryCommandInput),
      );

      const parsedNextPageToken: ParsedPageToken = {
        limit,
        initialEventAfter,
        initialEventBefore,
        reverse,
        lastEvaluatedKey,
      };

      return {
        aggregateIds: unmarshalledInitialEvents
          .map(item => unmarshall(item))
          .map(item => {
            const { aggregateId } = item as Pick<EventDetail, 'aggregateId'>;

            return unprefixAggregateId(eventStoreId, aggregateId);
          }),
        ...(lastEvaluatedKey !== undefined
          ? { nextPageToken: JSON.stringify(parsedNextPageToken) }
          : {}),
      };
    };

    this.putSnapshot = async () => new Promise(resolve => resolve());

    this.getLastSnapshot = async () =>
      new Promise(resolve => resolve({ snapshot: undefined }));

    this.listSnapshots = async () =>
      new Promise(resolve => resolve({ snapshots: [] }));
  }
}
