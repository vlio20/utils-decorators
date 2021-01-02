import {BeforeConfig} from './before.model';
import {Method} from '../common/model/common.model';

export function beforify(originalMethod: Method<void>, config: BeforeConfig<any>): Method<void> {
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
      originalMethod.apply(this, args);
    } else {
      beforeFunc();
      originalMethod.apply(this, args);
    }
  };
}
