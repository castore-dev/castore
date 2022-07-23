import type { AttributeValue } from '@aws-sdk/client-dynamodb';

export type ParsedPageToken = {
  limit?: number;
  lastEvaluatedKey?: Record<string, AttributeValue>;
};

export const parseAppliedListAggregateIdsOptions = ({
  inputLimit,
  inputPageToken,
}: {
  inputLimit?: number;
  inputPageToken?: string;
}): {
  appliedLimit?: ParsedPageToken['limit'];
  appliedLastEvaluatedKey?: ParsedPageToken['lastEvaluatedKey'];
} => {
  let appliedLimit: ParsedPageToken['limit'];
  let appliedLastEvaluatedKey: ParsedPageToken['lastEvaluatedKey'];

  if (typeof inputPageToken === 'string') {
    let parsedInputPageToken: ParsedPageToken;

    try {
      parsedInputPageToken = JSON.parse(inputPageToken) as ParsedPageToken;
    } catch (error) {
      throw new Error('Invalid page token');
    }

    const { limit: prevLimit, lastEvaluatedKey: prevLastEvaluatedKey } =
      parsedInputPageToken;

    if (prevLimit !== undefined) {
      appliedLimit = prevLimit;
    }

    if (prevLastEvaluatedKey !== undefined) {
      appliedLastEvaluatedKey = prevLastEvaluatedKey;
    }
  }

  // Use options limit if one is provided
  if (inputLimit !== undefined) {
    appliedLimit = inputLimit;
  }

  return {
    appliedLimit,
    appliedLastEvaluatedKey,
  };
};
