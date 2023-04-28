export const isTransactionCancelledBecauseOfConditionalCheckFailed = (
  error: unknown,
): boolean => {
  if (typeof error !== 'object') {
    return false;
  }

  const _error = error as { CancellationReasons?: { Code: string }[] };

  return (_error.CancellationReasons ?? []).some(
    ({ Code }) => Code === 'ConditionalCheckFailed',
  );
};
