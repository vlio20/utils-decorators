import { AsyncMethod } from '../common/model/common.model';
import { ThrottleAsyncExecutor } from './throttle-async-executor';

export function throttleAsyncify<D = any>(originalMethod: AsyncMethod<D>, parallelCalls = 1): AsyncMethod<D> {
  const executor = new ThrottleAsyncExecutor(originalMethod, parallelCalls);

  return function (...args: any[]): Promise<D> {
    return executor.exec(this, args);
  };
}
