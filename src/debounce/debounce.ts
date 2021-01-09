import {Decorator, Method} from '../common/model/common.model';
import {debouncify} from './debouncify';

export function debounce<T = any>(delayMs: number): Decorator<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor.value) {
      descriptor.value = debouncify(descriptor.value, delayMs);

      return descriptor;
    }

    throw new Error('@debounce is applicable only on a methods.');
  };
}
