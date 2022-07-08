import { O } from 'ts-toolbelt';

export type OmitUndefinableKeys<Obj extends Record<string, unknown>> = Omit<
  Obj,
  O.UndefinableKeys<Obj>
>;
