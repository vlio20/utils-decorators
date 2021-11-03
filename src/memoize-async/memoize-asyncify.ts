import { AsyncMethod, UnboxPromise } from '../common/model/common.model';
import { TaskExec } from '../common/tesk-exec/task-exec';
import { AsyncMemoizeConfig } from './memoize-async.model';

export function memoizeAsyncify<M extends AsyncMethod<any>>(originalMethod: M): M;
export function memoizeAsyncify<M extends AsyncMethod<any>>(originalMethod: M, config: AsyncMemoizeConfig<any, UnboxPromise<ReturnType<M>>>): M;
export function memoizeAsyncify<M extends AsyncMethod<any>>(originalMethod: M, expirationTimeMs: number): M;
export function memoizeAsyncify<M extends AsyncMethod<any>>(originalMethod: M, input?: AsyncMemoizeConfig<any, UnboxPromise<ReturnType<M>>> | number): M {
  const defaultConfig: AsyncMemoizeConfig<any, UnboxPromise<ReturnType<M>>> = {
    cache: new Map<string, UnboxPromise<ReturnType<M>>>(),
  };
  const runner = new TaskExec();
  const promCache = new Map<string, Promise<any>>();
  let resolvedConfig = {
    ...defaultConfig,
  } as AsyncMemoizeConfig<any, UnboxPromise<ReturnType<M>>>;

  if (typeof input === 'number') {
    resolvedConfig.expirationTimeMs = input;
  } else {
    resolvedConfig = {
      ...resolvedConfig,
      ...input,
    };
  }

  return async function (...args: any[]): Promise<any> {
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
          resolvedConfig.cache.set(key, data);

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
  } as M;
}
