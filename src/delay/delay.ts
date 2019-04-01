import {Delayable} from './delay.model';
import {Method} from '../common/model/common.model';

export function delay(delayMs: number): Delayable {
  return (target: any,
          propertyName: string,
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
