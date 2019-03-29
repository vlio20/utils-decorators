const MEMOIZED_VALUE_KEY = '_memoizedAsyncValue';

export function memoizeAsync<D>(expirationTimeMs: number,
                                keyResolver?: KeyResolver): any {
  return (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<AsyncMethod<D>>) => {
    if (descriptor.value != null) {
      const originalMethod = descriptor.value;
      const fn: any = function (...args: any[]): Promise<D> {
        let key = MEMOIZED_VALUE_KEY + '_';

        if (keyResolver) {
          key += keyResolver(...args);
        } else {
          key += JSON.stringify(args);
        }

        if (!fn.hasOwnProperty(key)) {
          fn[key] = originalMethod.apply(this, args)
            .then((resp) => {
              setTimeout(() => {
                  clearMemoizedValue(fn, key);
                },
                expirationTimeMs
              );

              return resp;
            })
            .catch((e) => {
              clearMemoizedValue(fn, key);

              return Promise.reject(e);
            });
        }

        return fn[key];
      };

      descriptor.value = fn;

      return descriptor;
    } else {
      throw Error('@memoizeAsync is applicable only on a methods.');
    }
  };
}

export function clearMemoizedValue(fn: any, key: string): any {
  delete fn[key];
}

export type KeyResolver = (...args: any[]) => string;
export type AsyncMethod<D> = (...args: any[]) => Promise<D>;
