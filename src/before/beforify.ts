import { Method } from '../common/model/common.model';
import { BeforeConfig } from './before.model';

export function beforify<D = any, A extends any[] = any[]>(
  originalMethod: Method<D, A>, config: BeforeConfig<any>,
): Method<Promise<D> | D, A> {
  const resolvedConfig: BeforeConfig<any> = {
    wait: false,
    ...config,
  };

  return function (...args: A): Promise<D> | D {
    const beforeFunc = typeof resolvedConfig.func === 'string'
      ? this[resolvedConfig.func].bind(this)
      : resolvedConfig.func;

    if (resolvedConfig.wait) {
      return beforeFunc().then(() => {
        return originalMethod.apply(this, args);
      });
    }

    beforeFunc();
    return originalMethod.apply(this, args);
  };
}
