export type $Contravariant<
  CONSTRAINED,
  CONSTRAINT,
  ARG = CONSTRAINED,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = CONSTRAINT extends CONSTRAINED ? any : ARG;
