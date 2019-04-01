import {AsyncMemoizable, AsyncMethod, MemoizeAsyncConfig} from '..';

export function memoizeAsync<D>(config: MemoizeAsyncConfig<D>): AsyncMemoizable<D>;
export function memoizeAsync<D>(expirationTimeMs: number): AsyncMemoizable<D>;
export function memoizeAsync<D>(input: MemoizeAsyncConfig<D> | number): AsyncMemoizable<D> {
  const defaultConfig: MemoizeAsyncConfig<D> = {
    cache: new Map<string, Promise<D>>(),
    expirationTimeMs: 1000 * 60
  };

  return (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<AsyncMethod<D>>): TypedPropertyDescriptor<AsyncMethod<D>> => {

    let config = <MemoizeAsyncConfig<D>>{
      ...defaultConfig
    };

    if (typeof input === 'number') {
      config.expirationTimeMs = input;
    } else {
      config = {
        ...config,
        ...input
      };
    }

    if (descriptor.value != null) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]): Promise<D> {
        let key;

        if (config.keyResolver) {
          key = config.keyResolver(...args);
        } else {
          key = JSON.stringify(args);
        }

        if (!config.cache.has(key)) {
          const promise = originalMethod.apply(this, args)
            .then((resp) => {
              setTimeout(() => {
                  config.cache.delete(key);
                },
                config.expirationTimeMs
              );

              return resp;
            })
            .catch((e) => {
              config.cache.delete(key);

              return Promise.reject(e);
            });

          config.cache.set(key, promise);
        }

        return config.cache.get(key);
      };

      return descriptor;
    } else {
      throw Error('@memoizeAsync is applicable only on a methods.');
    }
  };
}
