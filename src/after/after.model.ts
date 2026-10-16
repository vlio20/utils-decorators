import { CompatibleKeys } from '../common/model/common.model';

export type AfterFunc<D = unknown, A extends unknown[] = unknown[]> = (x: AfterParams<D, A>) => void;
export interface AfterConfig<T = unknown, D = unknown, A extends unknown[] = unknown[]> {
  func: AfterFunc<D, A> | CompatibleKeys<T, [AfterParams<D, A>]>;
  wait?: boolean;
}
export interface AfterParams<D = unknown, A extends unknown[] = unknown[]> {
  args: A;
  response: D;
}
