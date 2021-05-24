import { MemoizeConfig } from './memoize.model';
import { TaskExec } from '../common/tesk-exec/task-exec';
import { Method } from '../common/model/common.model';

export function memoizify<D = any>(originalMethod: Method<D>): Method<D>;
export function memoizify<D = any>(originalMethod: Method<D>, config: MemoizeConfig<any, D>): Method<D>;
export function memoizify<D = any>(originalMethod: Method<D>, expirationTimeMs: number): Method<D>;
export function memoizify<D = any>(originalMethod: Method<D>, input?: MemoizeConfig<any, D> | number): Method<D> {
  const defaultConfig: MemoizeConfig<any, D> = {
    cache: new Map<string, D>(),
  };
  const runner = new TaskExec();
  let resolvedConfig = {
    ...defaultConfig,
  } as MemoizeConfig<any, D>;

  if (typeof input === 'number') {
    resolvedConfig.expirationTimeMs = input;
  } else {
    resolvedConfig = {
      ...resolvedConfig,
      ...input,
    };
  }

  return function (...args: any[]): D {
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

      if (resolvedConfig.expirationTimeMs !== undefined) {
        runner.exec(() => {
          resolvedConfig.cache.delete(key);
        }, resolvedConfig.expirationTimeMs);
      }

      resolvedConfig.cache.set(key, response);
    }

    return resolvedConfig.cache.get(key);
  };
}
