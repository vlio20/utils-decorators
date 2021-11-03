import { AsyncMethod } from '../common/model/common.model';
import { ThrottleAsyncExecutor } from './throttle-async-executor';

export function throttleAsyncify<M extends AsyncMethod<any>>(originalMethod: M, parallelCalls = 1): M {
  const executor = new ThrottleAsyncExecutor(originalMethod, parallelCalls);

  return function (...args: any[]): Promise<any> {
    return executor.exec(this, args);
  } as M;
}
