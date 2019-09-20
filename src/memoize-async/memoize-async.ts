import {AsyncMemoizable, AsyncMethod, MemoizeAsyncConfig} from '..';

export function memoizeAsync<T extends any, D>(config: MemoizeAsyncConfig<T, D>): AsyncMemoizable<T, D>;
export function memoizeAsync<T extends any, D>(expirationTimeMs: number): AsyncMemoizable<T, D>;
export function memoizeAsync<T extends any, D>(input: MemoizeAsyncConfig<T, D> | number): AsyncMemoizable<T, D> {
  const defaultConfig: MemoizeAsyncConfig<any, D> = {
    cache: new Map<string, D>(),
    expirationTimeMs: 1000 * 60
  };

  const promCache = new Map<string, Promise<D>>();

  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<AsyncMethod<D>>): TypedPropertyDescriptor<AsyncMethod<D>> => {
    let resolvedConfig = <MemoizeAsyncConfig<T, D>>{
      ...defaultConfig
    };

    if (typeof input === 'number') {
      resolvedConfig.expirationTimeMs = input;
    } else {
      resolvedConfig = {
        ...resolvedConfig,
        ...input
      };
    }

    if (descriptor.value) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]): Promise<D> {
        const keyResolver = typeof resolvedConfig.keyResolver === 'string' ?
          this[resolvedConfig.keyResolver].bind(this) :
          resolvedConfig.keyResolver;

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
          if (await resolvedConfig.cache.has(key)) {
            resolve(await resolvedConfig.cache.get(key));
          } else {
            try {
              const data = await originalMethod.apply(this, args);
              resolvedConfig.cache.set(key, data);

              setTimeout(() => {
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
    } else {
      throw Error('@memoizeAsync is applicable only on a methods.');
    }
  };
}
