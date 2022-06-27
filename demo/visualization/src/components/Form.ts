import { FormProps } from '@rjsf/core';
// @ts-ignore Bad export from rjsf
import $Form from '@rjsf/material-ui/v5';
import { JSONSchema } from 'json-schema-to-ts';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const Form: (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Omit<FormProps<any>, 'schema'> & { schema: JSONSchema },
) => JSX.Element = $Form;
