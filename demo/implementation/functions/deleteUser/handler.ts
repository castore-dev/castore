import { deleteUserCommand } from '@castore/demo-blueprint';

import { userEventStore } from '~/libs/eventStores/users';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const deleteUser = async (
  event: Parameters<typeof deleteUserCommand.handler>[0],
): Promise<void> => {
  await deleteUserCommand.handler(event, [userEventStore]);
};

export const main = applyConsoleMiddleware(deleteUser, {
  inputSchema: deleteUserCommand.inputSchema,
});
