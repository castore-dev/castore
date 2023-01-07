import { CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';

import { EventStore, Command, CommandId, CommandContext } from '@castore/core';
import { JSONSchemaCommand } from '@castore/json-schema-command';

import { UnthemedReactVisualizer } from './UnthemedReactVisualizer';
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

export const ReactVisualizer = <C extends JSONSchemaCommand[]>({
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
    <UnthemedReactVisualizer
      commands={commands}
      eventStores={eventStores}
      contextsByCommandId={contextsByCommandId}
    />
  </ThemeProvider>
);
