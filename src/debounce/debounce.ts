import {Method} from '..';
import {Debouncable} from './debounce.model';

export function debounce(delayMs: number): Debouncable {
  return (target: any,
          propertyName: string,
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
