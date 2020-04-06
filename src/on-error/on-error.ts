import {Method} from '../common/model/common.model';
import {OnErrorable, OnErrorConfig, OnErrorHandler} from './on-error.model';

export function onError<T>(config: OnErrorConfig<T>): OnErrorable<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor.value) {
      const originalMethod: Function = descriptor.value;
      descriptor.value = async function (...args: any[]): Promise<any> {
        const onErrorFunc: OnErrorHandler = typeof config.func === 'string'
          ? this[config.func].bind(this) : config.func;

        try {
          return await originalMethod.apply(this, args);
        } catch (e) {
          return onErrorFunc(e, args);
        }
      };

      return descriptor;
    }

    throw new Error('@onError is applicable only on a methods.');
  };
}
