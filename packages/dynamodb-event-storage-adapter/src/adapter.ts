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
import {
  marshall,
  unmarshall,
  marshallOptions as MarshallOptions,
} from '@aws-sdk/util-dynamodb';

import {
  Aggregate,
  EventDetail,
  GroupedEvent,
  StorageAdapter,
} from '@castore/core';

import {
  EVENT_TABLE_INITIAL_EVENT_INDEX_NAME,
  EVENT_TABLE_IS_INITIAL_EVENT_KEY,
  EVENT_TABLE_PK,
  EVENT_TABLE_SK,
  EVENT_TABLE_TIMESTAMP_KEY,
} from './constants';
import { DynamoDBEventAlreadyExistsError } from './error';
import {
  parseAppliedListAggregateIdsOptions,
  ParsedPageToken,
} from './utils/parseAppliedListAggregateIdsOptions';

export const marshallOptions: MarshallOptions = {
  convertEmptyValues: false,
  removeUndefinedValues: true,
};

const isConditionalCheckFailedException = (error: Error): boolean =>
  typeof error === 'object' &&
  ((error as { code?: unknown }).code === 'ConditionalCheckFailedException' ||
    (error as { errorType?: unknown }).errorType ===
      'ConditionalCheckFailedException' ||
    (error as { name?: unknown }).name === 'ConditionalCheckFailedException');

type DynamoDbGroupedEvent<
  EVENT_DETAILS extends EventDetail = EventDetail,
  AGGREGATE extends Aggregate = Aggregate,
> = GroupedEvent<EVENT_DETAILS, AGGREGATE> & {
  eventStorageAdapter: DynamoDbEventStorageAdapter;
};

const hasDynamoDbEventStorageAdapter = (
  groupedEvent: GroupedEvent,
): groupedEvent is DynamoDbGroupedEvent =>
  groupedEvent.eventStorageAdapter instanceof DynamoDbEventStorageAdapter;

const hasContext = (
  groupedEvent: GroupedEvent,
): groupedEvent is GroupedEvent & {
  context: NonNullable<GroupedEvent['context']>;
} => groupedEvent.context !== undefined;

const parseGroupedEvents = (
  ...groupedEventsInput: GroupedEvent[]
): {
  groupedEvents: (DynamoDbGroupedEvent & {
    context: NonNullable<GroupedEvent['context']>;
  })[];
  timestamp?: string;
} => {
  let timestampInfos:
    | { timestamp: string; groupedEventIndex: number }
    | undefined;
  const groupedEvents: (DynamoDbGroupedEvent & {
    context: NonNullable<DynamoDbGroupedEvent['context']>;
  })[] = [];

  groupedEventsInput.forEach((groupedEvent, groupedEventIndex) => {
    if (!hasDynamoDbEventStorageAdapter(groupedEvent)) {
      throw new Error(
        `Event group event #${groupedEventIndex} is not connected to a DynamoDbEventStorageAdapter`,
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
    groupedEvents,
    ...(timestampInfos !== undefined
      ? { timestamp: timestampInfos.timestamp }
      : {}),
  };
};

export class DynamoDbEventStorageAdapter implements StorageAdapter {
  getEvents: StorageAdapter['getEvents'];
  getPushEventInput: (eventDetail: EventDetail) => PutItemCommandInput;
  pushEvent: StorageAdapter['pushEvent'];
  pushEventGroup: StorageAdapter['pushEventGroup'];
  groupEvent: StorageAdapter['groupEvent'];
  listAggregateIds: StorageAdapter['listAggregateIds'];

  putSnapshot: StorageAdapter['putSnapshot'];
  getLastSnapshot: StorageAdapter['getLastSnapshot'];
  listSnapshots: StorageAdapter['listSnapshots'];

  getTableName: () => string;
  tableName: string | (() => string);
  dynamoDbClient: DynamoDBClient;

  constructor({
    tableName,
    dynamoDbClient,
  }: {
    tableName: string | (() => string);
    dynamoDbClient: DynamoDBClient;
  }) {
    this.tableName = tableName;
    this.dynamoDbClient = dynamoDbClient;

    this.getTableName = () =>
      typeof this.tableName === 'string' ? this.tableName : this.tableName();

    // eslint-disable-next-line complexity
    this.getEvents = async (
      aggregateId,
      _,
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
            ':aggregateId': aggregateId,
            ...(maxVersion !== undefined ? { ':maxVersion': maxVersion } : {}),
            ...(minVersion !== undefined ? { ':minVersion': minVersion } : {}),
          },
          marshallOptions,
        ),
        ConsistentRead: true,
        ...(reverse !== undefined ? { ScanIndexForward: !reverse } : {}),
        ...(limit !== undefined ? { Limit: limit } : {}),
      });

      let eventsQueryResult = await this.dynamoDbClient.send(
        eventsQueryCommand,
      );
      marshalledEvents.push(...(eventsQueryResult.Items ?? []));

      while (eventsQueryResult.LastEvaluatedKey !== undefined) {
        eventsQueryCommand.input.ExclusiveStartKey =
          eventsQueryResult.LastEvaluatedKey;
        eventsQueryResult = await this.dynamoDbClient.send(eventsQueryCommand);

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
              aggregateId: evtAggregateId,
              version,
              type,
              timestamp,
              ...(payload !== undefined ? { payload } : {}),
              ...(metadata !== undefined ? { metadata } : {}),
            };
          }),
      };
    };

    this.getPushEventInput = event => {
      const { aggregateId, version, type, timestamp, payload, metadata } =
        event;

      return {
        TableName: this.getTableName(),
        Item: marshall(
          {
            aggregateId,
            version,
            type,
            timestamp,
            ...(payload !== undefined ? { payload } : {}),
            ...(metadata !== undefined ? { metadata } : {}),
            ...(version === 1 ? { isInitialEvent: 1 } : {}),
          },
          marshallOptions,
        ),
        ExpressionAttributeNames: { '#version': EVENT_TABLE_SK },
        ConditionExpression: 'attribute_not_exists(#version)',
      };
    };

    this.pushEvent = async (eventWithOptTimestamp, context) => {
      const event = {
        timestamp: new Date().toISOString(),
        ...eventWithOptTimestamp,
      };
      const putEventCommand = new PutItemCommand(this.getPushEventInput(event));

      const { aggregateId, version } = event;

      try {
        await this.dynamoDbClient.send(putEventCommand);
      } catch (error) {
        if (
          error instanceof Error &&
          isConditionalCheckFailedException(error)
        ) {
          const { eventStoreId } = context;

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

    this.pushEventGroup = async (...groupedEventsInput) => {
      const { groupedEvents, timestamp = new Date().toISOString() } =
        parseGroupedEvents(...groupedEventsInput);

      const [firstGroupedEvent] = groupedEvents;
      const dynamodbClient =
        firstGroupedEvent.eventStorageAdapter.dynamoDbClient;

      /**
       * @debt bug "TODO: Make pushEventGroup throws an EventAlreadyExists error if transaction fails"
       */
      await dynamodbClient.send(
        new TransactWriteItemsCommand({
          TransactItems: groupedEvents.map(groupedEvent => ({
            Put: groupedEvent.eventStorageAdapter.getPushEventInput({
              timestamp,
              ...groupedEvent.event,
            }),
          })),
        }),
      );

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
      _,
      { pageToken: inputPageToken, ...inputOptions } = {},
    ) => {
      const aggregateIdsQueryCommandInput: QueryCommandInput = {
        TableName: this.getTableName(),
        KeyConditionExpression: '#isInitialEvent = :true',
        ExpressionAttributeNames: {
          '#isInitialEvent': EVENT_TABLE_IS_INITIAL_EVENT_KEY,
        },
        ExpressionAttributeValues: marshall({ ':true': 1 }, marshallOptions),
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
              ? '#isInitialEvent = :true and #timestamp between :initialEventAfter and :initialEventBefore'
              : '#isInitialEvent = :true and #timestamp <= :initialEventBefore'
            : initialEventAfter !== undefined
            ? '#isInitialEvent = :true and #timestamp >= :initialEventAfter'
            : '#isInitialEvent = :true';

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
            marshallOptions,
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
      } = await this.dynamoDbClient.send(
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

            return aggregateId;
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
