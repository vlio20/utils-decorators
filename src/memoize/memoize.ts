import { Method } from '../common/model/common.model';
import { KeyResolver, Memoizable, MemoizeConfig } from './memoize.model';
import { memoizify } from './memoizify';

export function memoize<T = any, D = any>(): Memoizable<T, D>;
export function memoize<T = any, D = any>(config: MemoizeConfig<T, D>): Memoizable<T, D>;
export function memoize<T = any, D = any>(expirationTimeMs: number): Memoizable<T, D>;
export function memoize<T = any, D = any>(input?: MemoizeConfig<T, D> | number): Memoizable<T, D> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<D>>,
  ): TypedPropertyDescriptor<Method<D>> => {
    if (descriptor.value) {

      if (input && typeof input !== 'number' && (input.keyResolver as KeyResolver)?.bind) {
        input.keyResolver = (input.keyResolver as KeyResolver).bind({ target, propertyName });
      }

      descriptor.value = memoizify(descriptor.value, input as any);

      return descriptor;
    }
    throw new Error('@memoize is applicable only on a methods.');
  };
}
