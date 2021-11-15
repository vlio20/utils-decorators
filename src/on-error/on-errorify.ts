import { AsyncMethod } from '../common/model/common.model';
import { OnErrorConfig, OnErrorHandler } from './on-error.model';

export function onErrorify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>, config: OnErrorConfig<any>): AsyncMethod<D, A> {
  return async function (...args: A): Promise<D> {
    const onErrorFunc: OnErrorHandler = typeof config.func === 'string'
      ? this[config.func].bind(this) : config.func;

    try {
      const res = await originalMethod.apply(this, args);
      return res;
    } catch (e) {
      return onErrorFunc(e, args);
    }
  };
}
