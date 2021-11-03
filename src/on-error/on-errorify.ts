import { AsyncMethod } from '../common/model/common.model';
import { OnErrorConfig, OnErrorHandler } from './on-error.model';

export function onErrorify<M extends AsyncMethod<any>>(originalMethod: M, config: OnErrorConfig<any>): M {
  return async function (...args: any[]): Promise<any> {
    const onErrorFunc: OnErrorHandler = typeof config.func === 'string'
      ? this[config.func].bind(this) : config.func;

    try {
      const res = await originalMethod.apply(this, args);
      return res;
    } catch (e) {
      return onErrorFunc(e, args);
    }
  } as M;
}
