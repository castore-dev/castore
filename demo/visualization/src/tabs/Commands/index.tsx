import { Stack } from '@mui/material';
import React from 'react';

import type { JSONSchemaCommand } from '@castore/core';

import { CommandCard } from './CommandCard';

export const Commands = ({
  commands,
}: {
  commands: JSONSchemaCommand[];
}): JSX.Element => (
  <Stack spacing={2}>
    {commands.map(command => (
      <CommandCard key={command.commandId} command={command} />
    ))}
  </Stack>
);
