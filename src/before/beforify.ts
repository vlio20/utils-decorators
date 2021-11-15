import { Method } from '../common/model/common.model';
import { BeforeConfig } from './before.model';

export function beforify<D = any, A extends any[] = any[]>(
  originalMethod: Method<D, A>, config: BeforeConfig<any>,
): Method<Promise<D>, A> {
  const resolvedConfig: BeforeConfig<any> = {
    wait: false,
    ...config,
  };

  return async function (...args: A): Promise<D> {
    const beforeFunc = typeof resolvedConfig.func === 'string'
      ? this[resolvedConfig.func].bind(this)
      : resolvedConfig.func;

    if (resolvedConfig.wait) {
      await beforeFunc();
      return originalMethod.apply(this, args);
    }

    beforeFunc();
    return originalMethod.apply(this, args);
  };
}
