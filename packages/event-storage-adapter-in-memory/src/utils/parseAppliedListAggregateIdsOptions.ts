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

export const parseAppliedListAggregateIdsOptions = ({
  inputOptions,
  inputPageToken,
}: {
  inputOptions?: Omit<ParsedPageToken, 'lastEvaluatedKey'>;
  inputPageToken?: string;
}): Omit<ParsedPageToken, 'lastEvaluatedKey'> & {
  exclusiveStartKey?: ParsedPageToken['lastEvaluatedKey'];
} => {
  let prevOptions: ParsedPageToken = {};

  if (typeof inputPageToken === 'string') {
    try {
      prevOptions = JSON.parse(inputPageToken) as ParsedPageToken;
    } catch (error) {
      throw new Error('Invalid page token');
    }
  }

  return {
    limit: inputOptions?.limit ?? prevOptions.limit,
    initialEventAfter:
      inputOptions?.initialEventAfter ?? prevOptions.initialEventAfter,
    initialEventBefore:
      inputOptions?.initialEventBefore ?? prevOptions.initialEventBefore,
    reverse: inputOptions?.reverse ?? prevOptions.reverse,
    exclusiveStartKey: prevOptions.lastEvaluatedKey,
  };
};
