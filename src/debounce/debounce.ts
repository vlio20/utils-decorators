import { Decorator, Method } from '../common/model/common.model';
import { debouncify } from './debouncify';

export function debounce<T = any>(delayMs: number): Decorator<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor.value) {
      const methodsMap = new WeakMap<any, Method<any>>();
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: any[]) {
        let method = methodsMap.get(this);
        if (!method) {
          method = debouncify(originalMethod, delayMs).bind(this);
          methodsMap.set(this, method);
        }

        method(...args);
      };

      return descriptor;
    }

    throw new Error('@debounce is applicable only on a methods.');
  };
}
