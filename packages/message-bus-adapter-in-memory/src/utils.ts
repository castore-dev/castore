import { isEventCarryingMessage } from '@castore/core';

import type { Task } from './message';
import type { FilterPattern } from './types';

export const doesTaskMatchFilterPattern = (
  task: Task,
  filterPattern: FilterPattern,
): boolean => {
  const { message, replay = false } = task;
  const {
    eventStoreId: filterEventStoreId,
    eventType: filterEventType,
    onReplay = false,
  } = filterPattern;

  let messageEventType: string | undefined = undefined;
  const { eventStoreId: messageEventStoreId } = message;

  if (isEventCarryingMessage(message)) {
    messageEventType = message.event.type;
  }

  if (replay && !onReplay) {
    return false;
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

export const doesTaskMatchAnyFilterPattern = (
  task: Task,
  filterPatterns: FilterPattern[],
): boolean =>
  filterPatterns.some(filterPattern =>
    doesTaskMatchFilterPattern(task, filterPattern),
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
