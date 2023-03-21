import type { A } from 'ts-toolbelt';

import type { NotificationMessageQueue } from './notificationMessageQueue';
import type { notificationMessageQueue } from './notificationMessageQueue.util.test';

// --- EXTENDS ---

const assertExtends: A.Extends<
  typeof notificationMessageQueue,
  NotificationMessageQueue
> = 1;
assertExtends;
