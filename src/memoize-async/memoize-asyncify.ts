import { TaskExec } from '../common/tesk-exec/task-exec';
import { AsyncMemoizeConfig } from './memoize-async.model';

export function memoizeAsyncify<D, A extends unknown[], T>(originalMethod: (this: T, ...args: A) => Promise<D>): (this: T, ...args: A) => Promise<D>;
export function memoizeAsyncify<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => Promise<D>,
  config: NoInfer<AsyncMemoizeConfig<T, D, A>>
): (this: T, ...args: A) => Promise<D>;
export function memoizeAsyncify<D, A extends unknown[], T>(originalMethod: (this: T, ...args: A) => Promise<D>, expirationTimeMs: number): (this: T, ...args: A) => Promise<D>;

export function memoizeAsyncify<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => Promise<D>,
  input?: NoInfer<AsyncMemoizeConfig<T, D, A>> | number,
): (this: T, ...args: A) => Promise<D> {
  const config = typeof input === 'number' ? { expirationTimeMs: input } : input;
  const resolvedConfig = {
    ...config,
    cache: config?.cache ?? new Map<string, D>(),
  };
  const runner = new TaskExec();
  const promCache = new Map<string, Promise<D>>();

  return async function (this: T, ...args: A): Promise<D> {
    const keyResolver = typeof resolvedConfig.keyResolver === 'function' || resolvedConfig.keyResolver === undefined
      ? resolvedConfig.keyResolver
      : (this[resolvedConfig.keyResolver] as (...args: A) => string).bind(this);

    let key;

    if (keyResolver) {
      key = keyResolver(...args);
    } else {
      key = JSON.stringify(args);
    }

    const cachedPromise = promCache.get(key);
    if (cachedPromise) {
      return cachedPromise;
    }

    const prom = new Promise<D>(async (resolve, reject) => {
      let inCache: boolean;

      try {
        inCache = await resolvedConfig.cache.has(key);
      } catch (e) {
        reject(e);

        return;
      }

      if (inCache) {
        let data: D | null | undefined;
        try {
          data = await resolvedConfig.cache.get(key);
        } catch (e) {
          reject(e);

          return;
        }

        // The cache has confirmed this key exists.
        resolve(data as D);
      } else {
        try {
          const data = await originalMethod.apply(this, args);
          await resolvedConfig.cache.set(key, data);

          if (resolvedConfig.expirationTimeMs !== undefined) {
            runner.exec(() => {
              resolvedConfig.cache.delete(key);
            }, resolvedConfig.expirationTimeMs);
          }

          resolve(data);
        } catch (e) {
          reject(e);
        }
      }

      promCache.delete(key);
    });

    promCache.set(key, prom);

    return prom;
  };
}
