export type ParsedPageToken = {
  limit?: number;
  exclusiveEndIndex?: number;
};

export const parseAppliedListAggregateIdsOptions = ({
  inputLimit,
  inputPageToken,
}: {
  inputLimit?: number;
  inputPageToken?: string;
}): {
  appliedLimit?: ParsedPageToken['limit'];
  appliedStartIndex?: ParsedPageToken['exclusiveEndIndex'];
} => {
  let appliedLimit: ParsedPageToken['limit'];
  let appliedStartIndex: ParsedPageToken['exclusiveEndIndex'];

  if (typeof inputPageToken === 'string') {
    let parsedInputPageToken: ParsedPageToken;

    try {
      parsedInputPageToken = JSON.parse(inputPageToken) as ParsedPageToken;
    } catch (error) {
      throw new Error('Invalid page token');
    }

    const { limit: prevLimit, exclusiveEndIndex: prevExclusiveEndIndex } =
      parsedInputPageToken;

    if (prevLimit !== undefined) {
      appliedLimit = prevLimit;
    }

    if (prevExclusiveEndIndex !== undefined) {
      appliedStartIndex = prevExclusiveEndIndex;
    }
  }

  // Use options limit if one is provided
  if (inputLimit !== undefined) {
    appliedLimit = inputLimit;
  }

  return {
    appliedLimit,
    appliedStartIndex,
  };
};
