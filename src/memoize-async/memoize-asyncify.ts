import { AsyncMethod } from '../common/model/common.model';
import { TaskExec } from '../common/tesk-exec/task-exec';
import { AsyncMemoizeConfig } from './memoize-async.model';

export function memoizeAsyncify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>): AsyncMethod<D, A>;
export function memoizeAsyncify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>, config: AsyncMemoizeConfig<any, D>): AsyncMethod<D, A>;
export function memoizeAsyncify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>, expirationTimeMs: number): AsyncMethod<D, A>;

export function memoizeAsyncify<D = any, A extends any[] = any[]>(
  originalMethod: AsyncMethod<D, A>,
  input?: AsyncMemoizeConfig<any, D> | number,
): AsyncMethod<D, A> {
  const defaultConfig: AsyncMemoizeConfig<any, D> = {
    cache: new Map<string, D>(),
  };
  const runner = new TaskExec();
  const promCache = new Map<string, Promise<D>>();
  let resolvedConfig = {
    ...defaultConfig,
  } as AsyncMemoizeConfig<any, D>;

  if (typeof input === 'number') {
    resolvedConfig.expirationTimeMs = input;
  } else {
    resolvedConfig = {
      ...resolvedConfig,
      ...input,
    };
  }

  return async function (...args: A): Promise<D> {
    const keyResolver = typeof resolvedConfig.keyResolver === 'string'
      ? this[resolvedConfig.keyResolver].bind(this)
      : resolvedConfig.keyResolver;

    let key;

    if (keyResolver) {
      key = keyResolver(...args);
    } else {
      key = JSON.stringify(args);
    }

    if (promCache.has(key)) {
      return promCache.get(key);
    }

    const prom = new Promise<any>(async (resolve, reject) => {
      let inCache: boolean;

      try {
        inCache = await resolvedConfig.cache.has(key);
      } catch (e) {
        reject(e);

        return;
      }

      if (inCache) {
        let data: any;
        try {
          data = await resolvedConfig.cache.get(key);
        } catch (e) {
          reject(e);

          return;
        }

        resolve(data);
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
