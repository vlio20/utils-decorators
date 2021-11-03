import { Method } from '../common/model/common.model';
import { BeforeConfig } from './before.model';

export function beforify<M extends Method<any>>(
  originalMethod: M, config: BeforeConfig<any>,
): M {
  const resolvedConfig: BeforeConfig<any> = {
    wait: false,
    ...config,
  };

  return async function (...args: any[]): Promise<any> {
    const beforeFunc = typeof resolvedConfig.func === 'string'
      ? this[resolvedConfig.func].bind(this)
      : resolvedConfig.func;

    if (resolvedConfig.wait) {
      await beforeFunc();
      return originalMethod.apply(this, args);
    }

    beforeFunc();
    return originalMethod.apply(this, args);
  } as M;
}
