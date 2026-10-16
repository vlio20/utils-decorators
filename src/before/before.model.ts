import { CompatibleKeys } from '../common/model/common.model';

export interface BeforeConfig<T = unknown, A extends unknown[] = unknown[]> {
  func: ((...args: A) => unknown) | CompatibleKeys<T, A>;
  wait?: boolean;
}
