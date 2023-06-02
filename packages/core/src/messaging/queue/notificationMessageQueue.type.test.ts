import type { A } from 'ts-toolbelt';

import type { NotificationMessageChannel } from '../channel/notificationMessageChannel';
import type { NotificationMessageQueue } from './notificationMessageQueue';
import type { notificationMessageQueue } from './notificationMessageQueue.fixtures.test';

// --- EXTENDS ---

const assertExtendsNotificationMessageChannel: A.Extends<
  NotificationMessageQueue,
  NotificationMessageChannel
> = 1;
assertExtendsNotificationMessageChannel;

const assertInstanceExtendsNotificationMessageQueue: A.Extends<
  typeof notificationMessageQueue,
  NotificationMessageQueue
> = 1;
assertInstanceExtendsNotificationMessageQueue;
