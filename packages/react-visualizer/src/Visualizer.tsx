import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';

import type { JSONSchemaCommand } from '@castore/command-json-schema';
import { EventStore, Command, CommandId, CommandContext } from '@castore/core';

import { UnthemedVisualizer } from './UnthemedVisualizer';
import { defaultTheme } from './defaultTheme';

type ContextsByCommandId<COMMANDS extends Command[]> = COMMANDS extends [
  infer HEAD_COMMAND,
  ...infer TAIL_COMMANDS,
]
  ? HEAD_COMMAND extends Command
    ? TAIL_COMMANDS extends Command[]
      ? CommandContext<HEAD_COMMAND>['length'] extends 0
        ? ContextsByCommandId<TAIL_COMMANDS>
        : Record<CommandId<HEAD_COMMAND>, CommandContext<HEAD_COMMAND>> &
            ContextsByCommandId<TAIL_COMMANDS>
      : never
    : never
  : Record<never, unknown[]>;

export const Visualizer = <COMMANDS extends JSONSchemaCommand[]>({
  commands,
  eventStores,
  contextsByCommandId,
}: {
  commands: COMMANDS;
  eventStores: EventStore[];
  contextsByCommandId: ContextsByCommandId<COMMANDS>;
}): JSX.Element => (
  <ThemeProvider theme={defaultTheme}>
    <CssBaseline />
    <UnthemedVisualizer
      commands={commands}
      eventStores={eventStores}
      contextsByCommandId={contextsByCommandId}
    />
  </ThemeProvider>
);
