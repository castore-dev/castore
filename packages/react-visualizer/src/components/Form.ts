import { FormProps } from '@rjsf/core';
import MuiForm from '@rjsf/mui';
import { JSONSchema } from 'json-schema-to-ts';

// @ts-expect-error exported Form type is incorrect
export const Form: (
  props: Omit<FormProps, 'schema'> & { schema: JSONSchema },
) => JSX.Element = MuiForm;
