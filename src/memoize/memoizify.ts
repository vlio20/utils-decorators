import { Method } from '../common/model/common.model';
import { TaskExec } from '../common/tesk-exec/task-exec';
import { MemoizeConfig } from './memoize.model';

export function memoizify<D = any, A extends any[] = any[]>(originalMethod: Method<D, A>): Method<D, A>;
export function memoizify<D = any, A extends any[] = any[]>(originalMethod: Method<D, A>, config: MemoizeConfig<any, D>): Method<D, A>;
export function memoizify<D = any, A extends any[] = any[]>(originalMethod: Method<D, A>, expirationTimeMs: number): Method<D, A>;
export function memoizify<D = any, A extends any[] = any[]>(originalMethod: Method<D, A>, input?: MemoizeConfig<any, D> | number): Method<D, A> {
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

  return function (...args: A): D {
    const keyResolver = typeof resolvedConfig.keyResolver === 'string'
      ? this[resolvedConfig.keyResolver].bind(this)
      : resolvedConfig.keyResolver;

    const key = keyResolver
      ? keyResolver(...args)
      : JSON.stringify(args);

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
