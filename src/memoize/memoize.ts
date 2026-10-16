import { perInstance } from '../common/utils/per-instance';
import { ConfiguredMemoizable, Memoizable, MemoizeConfig  } from '../memoize/memoize.model';
import { Method } from '../common/model/common.model';
import { memoizify } from './memoizify';

export function memoize<const C extends MemoizeConfig<any, any, any[]>>(config: C): ConfiguredMemoizable<C>;
export function memoize<T = unknown, D = unknown>(): Memoizable<T, D>;
export function memoize<T = unknown, D = unknown>(expirationTimeMs: number): Memoizable<T, D>;
export function memoize<T = unknown, D = unknown>(input?: MemoizeConfig<T, D> | number): any {
  return <F extends Method<D, any[], any>>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F>,
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      const originalMethod = descriptor.value;
      descriptor.value = perInstance(() => memoizify(originalMethod, input as any) as F);

      return descriptor;
    }
    throw new Error('@memoize is applicable only on a methods.');
  };
}
