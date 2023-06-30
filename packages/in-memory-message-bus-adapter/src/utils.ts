import type { Message } from '@castore/core';
import { isEventCarryingMessage } from '@castore/core';

import type { FilterPattern } from './types';

export const doesMessageMatchFilterPattern = (
  message: Message,
  filterPattern: FilterPattern,
): boolean => {
  const { eventStoreId: filterEventStoreId, eventType: filterEventType } =
    filterPattern;

  let messageEventType: string | undefined = undefined;
  const { eventStoreId: messageEventStoreId } = message;

  if (isEventCarryingMessage(message)) {
    messageEventType = message.event.type;
  }

  if (filterEventStoreId !== undefined && filterEventType !== undefined) {
    return (
      messageEventStoreId === filterEventStoreId &&
      messageEventType === filterEventType
    );
  }

  if (filterEventStoreId !== undefined) {
    return messageEventStoreId === filterEventStoreId;
  }

  return true;
};

export const doesMessageMatchAnyFilterPattern = (
  message: Message,
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
