import type { Message, AggregateExistsMessage } from '../message';

export const isAggregateExistsMessage = (
  message: Message,
): message is AggregateExistsMessage => 'aggregateId' in message;
