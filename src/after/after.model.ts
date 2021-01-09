export type AfterFunc<D> = (x?: AfterParams<D>) => void;

export interface AfterConfig<T = any, D = any> {
  func: AfterFunc<D> | keyof T;
  wait?: boolean;
}

export interface AfterParams<D = any> {
  args: any[];
  response: D;
}
