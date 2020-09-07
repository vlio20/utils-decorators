import {AsyncMethod, Decorator} from '../common/model/common.model';
import {ThrottleAsyncExecutor} from './throttle-async-executor';


export function throttleAsync<T = any, D = any>(parallelCalls = 1): Decorator<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<any>>,
  ): TypedPropertyDescriptor<AsyncMethod<D>> => {
    if (descriptor.value) {
      const originalMethod = descriptor.value;
      const executor = new ThrottleAsyncExecutor(originalMethod, parallelCalls)

      descriptor.value = function (...args: any[]): Promise<D> {
        return executor.exec(this, args);
      };

      return descriptor;
    }

    throw new Error('@throttleAsync is applicable only on a methods.');
  };
}
