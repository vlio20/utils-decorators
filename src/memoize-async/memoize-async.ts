import {AsyncMemoizable, AsyncMemoizeConfig} from './memoize-async.model';
import {AsyncMethod} from '../common/model/common.model';
import {memoizeAsyncify} from './memoize-asyncify';

export function memoizeAsync<T = any, D = any>(): AsyncMemoizable<T, D>;
export function memoizeAsync<T = any, D = any>(config: AsyncMemoizeConfig<T, D>): AsyncMemoizable<T, D>;
export function memoizeAsync<T = any, D = any>(expirationTimeMs: number): AsyncMemoizable<T, D>;
export function memoizeAsync<T = any, D = any>(input?: AsyncMemoizeConfig<T, D> | number): AsyncMemoizable<T, D> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<D>>,
  ): TypedPropertyDescriptor<AsyncMethod<D>> => {
    if (descriptor.value) {
      descriptor.value = memoizeAsyncify(descriptor.value, input);

      return descriptor;
    }

    throw new Error('@memoizeAsync is applicable only on a methods.');
  };
}
