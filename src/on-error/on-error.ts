import {Method} from '..';
import {OnErrorable, OnErrorConfig, OnErrorHandler} from './on-error.model';

export function onError<T>(config: OnErrorConfig<T>): OnErrorable<T> {

  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {

    if (descriptor.value != null) {
      const originalMethod: Function = descriptor.value;
      descriptor.value = async function (...args: any[]): Promise<any> {
        const onErrorFunc: OnErrorHandler = typeof config.func === 'string' ? this[config.func].bind(this) : config.func;

        if (config.wait) {
          try {
            return await originalMethod.apply(this, args);
          } catch (e) {
            return onErrorFunc(e, args);
          }
        } else {
          try {
            return originalMethod.apply(this, args);
          } catch (e) {
            return onErrorFunc(e, args);
          }
        }
      };

      return descriptor;
    } else {
      throw Error('@onError is applicable only on a methods.');
    }
  };
}
