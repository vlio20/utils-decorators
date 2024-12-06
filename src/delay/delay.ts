import { Decorator, Method } from '../common/model/common.model';
import { delayfy } from './delayfy';

export function delay<T = any>(delayMs: number): Decorator<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor && descriptor.value) {
      descriptor.value = delayfy(descriptor.value, delayMs);

      return descriptor;
    }

    throw new Error('@delay is applicable only on a methods.');
  };
}
