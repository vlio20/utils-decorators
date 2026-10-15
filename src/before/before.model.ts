import { CompatibleKeys } from '../common/model/common.model';

export interface BeforeConfig<T = unknown> {
  func: (() => unknown) | CompatibleKeys<T, []>;
  wait?: boolean;
}
