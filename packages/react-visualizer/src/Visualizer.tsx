import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';

import { EventStore, Command, CommandId, CommandContext } from '@castore/core';
import type { JSONSchemaCommand } from '@castore/json-schema-command';

import { UnthemedVisualizer } from './UnthemedVisualizer';
import { defaultTheme } from './defaultTheme';

type ContextsByCommandId<C extends Command[]> = C extends [infer H, ...infer T]
  ? H extends Command
    ? T extends Command[]
      ? CommandContext<H>['length'] extends 0
        ? ContextsByCommandId<T>
        : Record<CommandId<H>, CommandContext<H>> & ContextsByCommandId<T>
      : never
    : never
  : Record<never, unknown[]>;

export const Visualizer = <C extends JSONSchemaCommand[]>({
  commands,
  eventStores,
  contextsByCommandId,
}: {
  commands: C;
  eventStores: EventStore[];
  contextsByCommandId: ContextsByCommandId<C>;
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
