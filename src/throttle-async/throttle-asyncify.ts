import { ThrottleAsyncExecutor } from './throttle-async-executor';

export function throttleAsyncify<D, A extends unknown[], This = unknown>(
  originalMethod: (this: This, ...args: A) => Promise<D>,
  parallelCalls = 1,
): (this: This, ...args: A) => Promise<D> {
  const executor = new ThrottleAsyncExecutor(originalMethod, parallelCalls);

  return function (this: This, ...args: A): Promise<D> {
    return executor.exec(this, args);
  };
}
