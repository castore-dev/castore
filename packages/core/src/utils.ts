// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type $Contravariant<I, C, D = I> = C extends I ? any : D;
