import {Method} from '..';
import {Decorator} from '../common/model/common.model';

export function delay<T>(delayMs: number): Decorator<T> {
  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {

    if (descriptor.value != null) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]): any {
        setTimeout(() => {
          originalMethod.apply(this, args);
        }, delayMs);
      };

      return descriptor;
    } else {
      throw Error('@delay is applicable only on a methods.');
    }
  };
}
