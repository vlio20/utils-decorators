import { AsyncMethod, Method } from '../common/model/common.model';
import { TaskExec } from '../common/tesk-exec/task-exec';
import { AsyncMemoizeConfig } from './memoize-async.model';

export function memoizeAsyncify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>): AsyncMethod<D, A>;
export function memoizeAsyncify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>, config: AsyncMemoizeConfig<any, D>): AsyncMethod<D, A>;
export function memoizeAsyncify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>, expirationTimeMs: number): AsyncMethod<D, A>;

export function memoizeAsyncify<D = any, A extends any[] = any[]>(
  originalMethod: AsyncMethod<D, A>,
  input?: AsyncMemoizeConfig<any, D> | number,
): AsyncMethod<D, A> {
  const config = typeof input === 'number' ? { expirationTimeMs: input } : input;
  const resolvedConfig = {
    ...config,
    cache: config?.cache ?? new Map<string, D>(),
  };
  const runner = new TaskExec();
  const promCache = new Map<string, Promise<D>>();

  return async function (this: Record<PropertyKey, Method<any>>, ...args: A): Promise<D> {
    const keyResolver = typeof resolvedConfig.keyResolver === 'function' || resolvedConfig.keyResolver === undefined
      ? resolvedConfig.keyResolver
      : this[resolvedConfig.keyResolver].bind(this);

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
