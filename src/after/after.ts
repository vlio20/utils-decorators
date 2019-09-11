import {AfterFunc, Method} from '..';
import {AfterConfig} from './after.model';
import {Decorator} from '../common/model/common.model';

const defaultConfig: Partial<AfterConfig<any, any>> = {
  wait: false
};

export function after<T extends any, D>(config: AfterConfig<T, D>): Decorator<T> {
  const resolvedConfig: AfterConfig<T, D> = {
    ...defaultConfig,
    ...config
  };

  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {

    if (descriptor.value != null) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]): Promise<void> {
        const afterFunc: AfterFunc<D> = typeof resolvedConfig.func === 'string' ? this[resolvedConfig.func].bind(this) :
          resolvedConfig.func;

        if (resolvedConfig.wait) {
          const response = await originalMethod.apply(this, args);
          afterFunc({
            args,
            response
          });
        } else {
          const response = originalMethod.apply(this, args);
          afterFunc({
            args,
            response
          });
        }
      };

      return descriptor;
    } else {
      throw Error('@after is applicable only on a methods.');
    }
  };
}
