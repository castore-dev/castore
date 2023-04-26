export const isConditionalCheckFailedException = (error: Error): boolean =>
  typeof error === 'object' &&
  ((error as { code?: unknown }).code === 'ConditionalCheckFailedException' ||
    (error as { errorType?: unknown }).errorType ===
      'ConditionalCheckFailedException' ||
    (error as { name?: unknown }).name === 'ConditionalCheckFailedException');
