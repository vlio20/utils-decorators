import { Method } from '../common/model/common.model';
import { TaskExec } from '../common/tesk-exec/task-exec';
import { MemoizeConfig } from './memoize.model';

export function memoizify<M extends Method<any>>(originalMethod: M): M;
export function memoizify<M extends Method<any>>(originalMethod: M, config: MemoizeConfig<any, ReturnType<M>>): M;
export function memoizify<M extends Method<any>>(originalMethod: M, expirationTimeMs: number): M;
export function memoizify<M extends Method<any>>(originalMethod: M, input?: MemoizeConfig<any, ReturnType<M>> | number): M {
  const defaultConfig: MemoizeConfig<any, ReturnType<M>> = {
    cache: new Map<string, ReturnType<M>>(),
  };
  const runner = new TaskExec();
  let resolvedConfig = {
    ...defaultConfig,
  } as MemoizeConfig<any, ReturnType<M>>;

  if (typeof input === 'number') {
    resolvedConfig.expirationTimeMs = input;
  } else {
    resolvedConfig = {
      ...resolvedConfig,
      ...input,
    };
  }

  return function (...args: any[]): any {
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
  } as M;
}
