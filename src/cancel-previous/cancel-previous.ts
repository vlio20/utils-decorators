import { AnyMethod } from '../common/model/common.model';
import { CancelPreviousable } from './cancel-previous.model';
import { cancelPreviousify } from './cancel-previousify';

export function cancelPrevious<T = unknown>(): CancelPreviousable<T> {
  return <F extends AnyMethod>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F>,
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      descriptor.value = cancelPreviousify(descriptor.value) as F;

      return descriptor;
    }

    throw new Error('@cancelPrevious is applicable only on a methods.');
  };
}
