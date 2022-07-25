import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';

import type { JSONSchemaCommand } from '@castore/core';

import { Form } from '~/components/Form';
import { eventStoresById } from '~/services/data';

export const CommandCard = ({
  command,
}: {
  command: JSONSchemaCommand;
}): JSX.Element => {
  const { commandId, inputSchema, requiredEventStores, handler } = command;

  const requiredEvStores = requiredEventStores.map(
    ({ eventStoreId }) => eventStoresById[eventStoreId],
  );

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
              onSubmit={async ({ formData }) => {
                try {
                  const output: unknown = await handler(
                    formData,
                    requiredEvStores,
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
              }}
            />
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
