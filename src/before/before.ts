import {Method} from '..';
import {Beforable, BeforeConfig} from './before.model';

const defaultConfig: Partial<BeforeConfig> = {
  wait: false
};

export function before(config: BeforeConfig): Beforable {
  const resolvedConfig = {
    ...defaultConfig,
    ...config
  };

  return (target: any,
          propertyName: string,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {

    if (descriptor.value != null) {
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
      throw Error('@before is applicable only on a methods.');
    }
  };
}
