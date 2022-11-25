export const eventAlreadyExistsErrorCode = 'EventAlreadyExistsError';

export interface EventAlreadyExistsError extends Error {
  code: typeof eventAlreadyExistsErrorCode;
  eventStoreId?: string;
  aggregateId: string;
  version: number;
}

export const isEventAlreadyExistsError = (
  error: unknown,
): error is EventAlreadyExistsError =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as { code: unknown }).code === eventAlreadyExistsErrorCode;
