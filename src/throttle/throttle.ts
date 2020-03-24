import {Decorator, Method} from '../common/model/common.model';

export function throttle<T = any>(delayMs: number): Decorator<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor.value) {
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
    }

    throw new Error('@throttle is applicable only on a methods.');
  };
}
