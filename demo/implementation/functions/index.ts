import { createUser } from './createUser';
import { deleteUser } from './deleteUser';
import { logAggregateIds } from './logAggregateIds';
import { logUserEvents } from './logUserEvents';

export const functions = {
  logUserEvents,
  logAggregateIds,
  createUser,
  deleteUser,
};
