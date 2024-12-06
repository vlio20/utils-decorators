import { AsyncMethod, Decorator } from '../common/model/common.model';
import { throttleAsyncify } from './throttle-asyncify';

export function throttleAsync<T = any, D = any>(parallelCalls?: number): Decorator<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<any>>,
  ): TypedPropertyDescriptor<AsyncMethod<D>> => {
    if (descriptor && descriptor.value) {
      descriptor.value = throttleAsyncify(descriptor.value, parallelCalls);

      return descriptor;
    }

    throw new Error('@throttleAsync is applicable only on a methods.');
  };
}
