import { TaskExec } from '../common/tesk-exec/task-exec';
import { MemoizeConfig } from './memoize.model';

export function memoizify<D, A extends unknown[], T>(originalMethod: (this: T, ...args: A) => D): (this: T, ...args: A) => D;
export function memoizify<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => D,
  config: NoInfer<MemoizeConfig<T, D, A>>
): (this: T, ...args: A) => D;
export function memoizify<D, A extends unknown[], T>(originalMethod: (this: T, ...args: A) => D, expirationTimeMs: number): (this: T, ...args: A) => D;
export function memoizify<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => D,
  input?: NoInfer<MemoizeConfig<T, D, A>> | number
): (this: T, ...args: A) => D {
  const config = typeof input === 'number' ? { expirationTimeMs: input } : input;
  const resolvedConfig = {
    ...config,
    cache: config?.cache ?? new Map<string, D>(),
  };
  const runner = new TaskExec();

  return function (this: T, ...args: A): D {
    const keyResolver = typeof resolvedConfig.keyResolver === 'function' || resolvedConfig.keyResolver === undefined
      ? resolvedConfig.keyResolver
      : (this[resolvedConfig.keyResolver] as (...args: A) => string).bind(this);

    const key = keyResolver
      ? keyResolver(...args)
      : JSON.stringify(args);

    if (!resolvedConfig.cache.has(key)) {
      const response = originalMethod.apply(this, args);

      if (resolvedConfig.expirationTimeMs !== undefined) {
        runner.exec(() => {
          resolvedConfig.cache.delete(key);
        }, resolvedConfig.expirationTimeMs);
      }

      resolvedConfig.cache.set(key, response);
    }

    // A cache reporting has(key) must supply the cached value.
    return resolvedConfig.cache.get(key) as D;
  };
}
