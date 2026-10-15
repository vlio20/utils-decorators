import { AsyncDecorator, CompatibleKeys } from '../common/model/common.model';

export type OnErrorable<T = unknown> = AsyncDecorator<T>;
export interface OnErrorConfig<T = unknown, D = unknown, A extends unknown[] = unknown[]> {
  func: OnErrorHandler<D, A> | CompatibleKeys<T, [error: unknown, args: A], D>;
}
export type OnErrorHandler<D = unknown, A extends unknown[] = unknown[]> = (e: unknown, args: A) => D;
