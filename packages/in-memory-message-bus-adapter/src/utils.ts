import { AnyMessage } from '@castore/core';

import { FilterPattern } from './types';

export const doesMessageMatchFilterPattern = (
  message: AnyMessage,
  filterPattern: FilterPattern,
): boolean => {
  const { type, eventStoreId } = filterPattern;
  const { type: messageType, eventStoreId: messageEventStoreId } = message;

  if (eventStoreId !== undefined && type !== undefined) {
    return messageEventStoreId === eventStoreId && messageType === type;
  }

  if (eventStoreId !== undefined) {
    return messageEventStoreId === eventStoreId;
  }

  return true;
};

export const doesMessageMatchAnyFilterPattern = (
  message: AnyMessage,
  filterPatterns: FilterPattern[],
): boolean =>
  filterPatterns.some(filterPattern =>
    doesMessageMatchFilterPattern(message, filterPattern),
  );

export const parseRetryDelayInMs = (retryDelayInMs: number): number => {
  if (typeof retryDelayInMs !== 'number' || retryDelayInMs < 0) {
    throw new Error('Invalid retryDelayInMs, please select a positive number.');
  }

  return Math.round(retryDelayInMs);
};

export const parseRetryAttempts = (retryAttempts: number): number => {
  if (typeof retryAttempts !== 'number' || retryAttempts < 0) {
    throw new Error('Invalid retryAttempts, please select a positive integer.');
  }

  return Math.round(retryAttempts);
};

export const parseBackoffRate = (backoffRate: number): number => {
  if (typeof backoffRate !== 'number' || backoffRate < 0) {
    throw new Error('Invalid backoffRate, please select a positive number.');
  }

  return backoffRate;
};
