import {Memoizable, MemoizeConfig} from './memoize.model';
import {Method} from '..';

export function memoize<T, D>(config: MemoizeConfig<D>): Memoizable<T, D>;
export function memoize<T, D>(expirationTimeMs: number): Memoizable<T, D>;
export function memoize<T, D>(input: MemoizeConfig<D> | number): Memoizable<T, D> {
  const defaultConfig: MemoizeConfig<D> = {
    cache: new Map<string, D>(),
    expirationTimeMs: 1000 * 60
  };

  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<D>>): TypedPropertyDescriptor<Method<D>> => {
    let config = <MemoizeConfig<D>>{
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
      descriptor.value = function (...args: any[]): D {
        let key;

        if (config.keyResolver) {
          key = config.keyResolver(...args);
        } else {
          key = JSON.stringify(args);
        }

        if (!config.cache.has(key)) {
          const response = originalMethod.apply(this, args);
          setTimeout(() => {
              config.cache.delete(key);
            },
            config.expirationTimeMs
          );

          config.cache.set(key, response);
        }

        return config.cache.get(key);
      };

      return descriptor;
    } else {
      throw Error('@memoize is applicable only on a methods.');
    }
  };
}
