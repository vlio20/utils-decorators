import {AsyncMemoizeConfig} from './memoize-async.model';
import {TaskExec} from '../common/tesk-exec/task-exec';

export function memoizeAsyncify<D = any>(originalMethod: (...args: any[]) => Promise<D>,
                                         input?: AsyncMemoizeConfig<any, D> | number): (...args: any[]) => Promise<D> {
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

  return async function (...args: any[]): Promise<D> {
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

    const prom = new Promise<D>(async (resolve, reject) => {
      let inCache: boolean;

      try {
        inCache = await resolvedConfig.cache.has(key);
      } catch (e) {
        reject(e);

        return;
      }

      if (inCache) {
        let data: D;
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
  }
}
