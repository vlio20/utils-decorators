import {Method} from '..';
import {Afterable, AfterConfig} from './after.model';

const defaultConfig: Partial<AfterConfig> = {
  wait: false
};

export function after(config: AfterConfig): Afterable {
  const resolvedConfig = {
    ...defaultConfig,
    ...config
  };

  return (target: any,
          propertyName: string,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {

    if (descriptor.value != null) {
      const originalMethod = descriptor.value;
      descriptor.value = async function (...args: any[]): Promise<void> {
        const afterFunc = typeof resolvedConfig.func === 'string' ?
          this[resolvedConfig.func].bind(this) :
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
