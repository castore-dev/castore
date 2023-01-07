import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from '@mui/material';
import type { IChangeEvent } from '@rjsf/core';
import validator from '@rjsf/validator-ajv8';
import React from 'react';

import type { EventStore } from '@castore/core';
import type { JSONSchemaCommand } from '@castore/json-schema-command';

import { Form } from '~/components/Form';

export const CommandCard = ({
  command,
  eventStoresById,
  contextsByCommandId,
}: {
  command: JSONSchemaCommand;
  eventStoresById: Record<string, EventStore>;
  contextsByCommandId: Record<string, unknown[]>;
}): JSX.Element => {
  const { commandId, inputSchema, requiredEventStores, handler } = command;

  const requiredEvStores = requiredEventStores.map(
    ({ eventStoreId }) => eventStoresById[eventStoreId],
  );

  const context = contextsByCommandId[commandId];

  const onSubmit = async ({ formData }: IChangeEvent<unknown>) => {
    try {
      const output: unknown = await handler(
        formData,
        requiredEvStores,
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ...(context ?? []),
      );
      console.log(output);

      // TODO: Re-introduce
      // notification.success({
      //   message: 'Success',
      //   description: (<JsonView src={output} />),
      // });
    } catch (e: unknown) {
      console.error(e);
      // TODO: Re-introduce
      // notification.error({
      //   message: `Error ${
      //     (e as { statusCode: string }).statusCode
      //   }`,
      //   description: (e as { message: string }).message,
      // });
    }
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{commandId}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {inputSchema !== undefined && (
            <Form
              schema={inputSchema}
              validator={validator}
              onSubmit={(data: IChangeEvent<unknown>) => void onSubmit(data)}
            />
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
