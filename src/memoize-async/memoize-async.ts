import { ConfiguredMemoizable } from '../memoize/memoize.model';
import { AsyncMemoizable, AsyncMemoizeConfig } from './memoize-async.model';
import { AsyncMethod } from '../common/model/common.model';
import { memoizeAsyncify } from './memoize-asyncify';

export function memoizeAsync<const C extends AsyncMemoizeConfig<any, any, any[]>>(config: C): ConfiguredMemoizable<C, true>;
export function memoizeAsync<T = unknown, D = unknown>(): AsyncMemoizable<T, D>;
export function memoizeAsync<T = unknown, D = unknown>(expirationTimeMs: number): AsyncMemoizable<T, D>;
export function memoizeAsync<T = unknown, D = unknown>(input?: AsyncMemoizeConfig<T, D> | number): any {
  return <F extends AsyncMethod<D, any[], any>>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F>,
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      descriptor.value = memoizeAsyncify(descriptor.value, input as any) as F;

      return descriptor;
    }

    throw new Error('@memoizeAsync is applicable only on a methods.');
  };
}
