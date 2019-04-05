import {Method} from '..';
import {Throttable} from './throttle.model';

export function throttle(delayMs: number): Throttable {
  return (target: any,
          propertyName: string,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {

    if (descriptor.value != null) {
      const originalMethod = descriptor.value;
      let throttling = false;
      descriptor.value = function (...args: any[]): any {

        if (!throttling) {
          throttling = true;
          originalMethod.apply(this, args);

          setTimeout(() => {
            throttling = false;
          }, delayMs);
        }

      };

      return descriptor;
    } else {
      throw Error('@throttle is applicable only on a methods.');
    }
  };
}
