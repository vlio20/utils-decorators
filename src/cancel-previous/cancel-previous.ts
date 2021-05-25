import { CancelPreviousable } from './cancel-previous.model';
import { Method } from '../common/model/common.model';
import { cancelPreviousify } from './cancel-previousify';

export function cancelPrevious<T = any, D = any>(): CancelPreviousable<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<Promise<any>>>,
  ): TypedPropertyDescriptor<Method<Promise<any>>> => {
    if (descriptor.value) {
      descriptor.value = cancelPreviousify<D>(descriptor.value);

      return descriptor;
    }

    throw new Error('@cancelPrevious is applicable only on a methods.');
  };
}
