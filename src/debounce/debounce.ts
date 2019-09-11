import {Method} from '..';
import {Decorator} from '../common/model/common.model';

  export function debounce<T extends any>(delayMs: number): Decorator<T> {
  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {

    if (descriptor.value != null) {
      const originalMethod = descriptor.value;
      let handler: any;

      descriptor.value = function (...args: any[]): any {
        clearTimeout(handler);

        handler = setTimeout(() => {
          originalMethod.apply(this, args);
        }, delayMs);
      };

      return descriptor;
    } else {
      throw Error('@debounce is applicable only on a methods.');
    }
  };
}
