import {AsyncMemoizable, AsyncMemoizeConfig, AsyncMethod} from './memoize-async.model';
import {TaskExec} from '../common/tesk-exec/task-exec';

export function memoizeAsync<T = any, D = any>(config: AsyncMemoizeConfig<T, D>): AsyncMemoizable<T, D>;
export function memoizeAsync<T = any, D = any>(expirationTimeMs: number): AsyncMemoizable<T, D>;
export function memoizeAsync<T = any, D = any>(input: AsyncMemoizeConfig<T, D> | number): AsyncMemoizable<T, D> {
  const defaultConfig: AsyncMemoizeConfig<any, D> = {
    cache: new Map<string, D>(),
    expirationTimeMs: 1000 * 60,
  };
  const runner = new TaskExec();

  const promCache = new Map<string, Promise<D>>();

  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<D>>,
  ): TypedPropertyDescriptor<AsyncMethod<D>> => {
    let resolvedConfig = {
      ...defaultConfig,
    } as AsyncMemoizeConfig<T, D>;

    if (typeof input === 'number') {
      resolvedConfig.expirationTimeMs = input;
    } else {
      resolvedConfig = {
        ...resolvedConfig,
        ...input,
      };
    }

    if (descriptor.value) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]): Promise<D> {
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

              runner.exec(() => {
                resolvedConfig.cache.delete(key);
              }, resolvedConfig.expirationTimeMs);

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

      return descriptor;
    }
    throw new Error('@memoizeAsync is applicable only on a methods.');
  };
}
