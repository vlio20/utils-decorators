export type AfterFunc<D> = (x?: AfterParams<D>) => void;

export interface AfterConfig<T, D> {
  func: AfterFunc<D> | keyof T;
  wait?: boolean;
}

export interface AfterParams<D> {
  args: any[];
  response: D;
}
