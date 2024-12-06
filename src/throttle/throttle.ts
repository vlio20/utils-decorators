import { Decorator, Method } from '../common/model/common.model';
import { throttlify } from './throttlify';

export function throttle<T = any>(delayMs: number): Decorator<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor && descriptor.value) {
      descriptor.value = throttlify(descriptor.value, delayMs);

      return descriptor;
    }

    throw new Error('@throttle is applicable only on a methods.');
  };
}
