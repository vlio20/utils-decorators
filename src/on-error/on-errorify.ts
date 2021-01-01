import {AsyncMethod} from '../common/model/common.model';
import {OnErrorConfig, OnErrorHandler} from './on-error.model';

export function onErrorify<D>(originalMethod: AsyncMethod<D>, config: OnErrorConfig<any>): AsyncMethod<D> {
  return async function (...args: any[]): Promise<D> {
    const onErrorFunc: OnErrorHandler = typeof config.func === 'string'
      ? this[config.func].bind(this) : config.func;

    try {
      return await originalMethod.apply(this, args);
    } catch (e) {
      return onErrorFunc(e, args);
    }
  };
}
