import {Memoizable, MemoizeConfig} from './memoize.model';
import {Method} from '../common/model/common.model';
import {TaskExec} from '../common/tesk-exec/task-exec';

export function memoize<T = any, D = any>(config: MemoizeConfig<T, D>): Memoizable<T, D>;
export function memoize<T = any, D = any>(expirationTimeMs: number): Memoizable<T, D>;
export function memoize<T = any, D = any>(input: MemoizeConfig<T, D> | number): Memoizable<T, D> {
  const defaultConfig: MemoizeConfig<any, D> = {
    cache: new Map<string, D>(),
    expirationTimeMs: 60000,
  };
  const runner = new TaskExec();

  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<D>>,
  ): TypedPropertyDescriptor<Method<D>> => {
    let resolvedConfig = {
      ...defaultConfig,
    } as MemoizeConfig<T, D>;

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
      descriptor.value = function (...args: any[]): D {
        let key;
        const keyResolver = typeof resolvedConfig.keyResolver === 'string'
          ? this[resolvedConfig.keyResolver].bind(this)
          : resolvedConfig.keyResolver;

        if (keyResolver) {
          key = keyResolver(...args);
        } else {
          key = JSON.stringify(args);
        }

        if (!resolvedConfig.cache.has(key)) {
          const response = originalMethod.apply(this, args);

          runner.exec(() => {
            resolvedConfig.cache.delete(key);
          }, resolvedConfig.expirationTimeMs);

          resolvedConfig.cache.set(key, response);
        }

        return resolvedConfig.cache.get(key);
      };

      return descriptor;
    }
    throw new Error('@memoize is applicable only on a methods.');
  };
}
