import { FormProps } from '@rjsf/core';
import MuiForm from '@rjsf/mui';

// @ts-expect-error exported Form type is incorrect
export const Form: (
  props: Omit<FormProps, 'schema'> & { schema: unknown },
) => JSX.Element = MuiForm;
