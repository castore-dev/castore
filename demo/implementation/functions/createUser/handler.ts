import { createUserCommand } from '@castore/demo-blueprint';

import { userEventStore } from '@libs/eventStores/users';
import { applyConsoleMiddleware } from '@libs/middlewares/console';

export const createUser = async (
  event: Parameters<typeof createUserCommand.handler>[0],
): Promise<void> => {
  const output = await createUserCommand.handler(event, [userEventStore]);
  console.log('output');
  console.log(output);
};

export const main = applyConsoleMiddleware(createUser, {
  inputSchema: createUserCommand.inputSchema,
});
