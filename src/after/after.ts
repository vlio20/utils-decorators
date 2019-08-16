import {Method} from '..';
import {AfterConfig} from './after.model';
import {Decorator} from '../common/model/common.model';

const defaultConfig: Partial<AfterConfig<any>> = {
  wait: false
};

export function after<T>(config: AfterConfig<T>): Decorator<T> {
  const resolvedConfig: AfterConfig<T> = {
    ...defaultConfig,
    ...config
  };

  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {

    if (descriptor.value != null) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]): Promise<void> {
        const afterFunc = typeof resolvedConfig.func === 'string' ? this[resolvedConfig.func].bind(this) :
          resolvedConfig.func;

        if (resolvedConfig.wait) {
          await originalMethod.apply(this, args);
          afterFunc();
        } else {
          originalMethod.apply(this, args);
          afterFunc();
        }
      };

      return descriptor;
    } else {
      throw Error('@after is applicable only on a methods.');
    }
  };
}
