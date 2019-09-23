import {Method} from '..';
import {BeforeConfig} from './before.model';
import {Decorator} from '../common/model/common.model';

export function before<T extends any>(config: BeforeConfig<T>): Decorator<T> {
  const resolvedConfig: BeforeConfig<T> = {
    wait: false,
    ...config
  };

  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {

    if (descriptor.value) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]): Promise<any> {
        const beforeFunc = typeof resolvedConfig.func === 'string' ?
          this[resolvedConfig.func].bind(this) :
          resolvedConfig.func;

        if (resolvedConfig.wait) {
          await beforeFunc();
          originalMethod.apply(this, args);
        } else {
          beforeFunc();
          originalMethod.apply(this, args);
        }
      };

      return descriptor;
    } else {
      throw new Error('@before is applicable only on a methods.');
    }
  };
}
