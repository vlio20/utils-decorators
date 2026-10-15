import { Method } from '../common/model/common.model';
import { BeforeConfig } from './before.model';

export function beforify<D = any, A extends any[] = any[]>(
  originalMethod: Method<D, A>, config: BeforeConfig<any>,
): Method<Promise<D>, A> {
  const resolvedConfig: BeforeConfig<any> = {
    wait: false,
    ...config,
  };

  return async function (this: Record<PropertyKey, Method<any>>, ...args: A): Promise<D> {
    const beforeFunc = typeof resolvedConfig.func === 'function'
      ? resolvedConfig.func
      : this[resolvedConfig.func].bind(this);

    if (resolvedConfig.wait) {
      await beforeFunc();
      return originalMethod.apply(this, args);
    }

    beforeFunc();
    return originalMethod.apply(this, args);
  };
}
