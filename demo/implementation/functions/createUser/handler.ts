import { createUserCommand } from '@castore/demo-blueprint';

import { userEventStore } from '~/libs/eventStores/users';
import { applyConsoleMiddleware } from '~/libs/middlewares/console';

export const createUser = async (
  event: Parameters<typeof createUserCommand.handler>[0],
): Promise<void> => {
  await createUserCommand.handler(event, [userEventStore]);
};

export const main = applyConsoleMiddleware(createUser, {
  inputSchema: createUserCommand.inputSchema,
});
