import { AnyMethod } from '../common/model/common.model';
import { Timeoutable } from './timeout.model';
import { timeoutify } from './timeoutify';

export function timeout<T = unknown>(ms: number): Timeoutable<T> {
  return <F extends AnyMethod>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F>,
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      descriptor.value = timeoutify(descriptor.value, ms) as F;

      return descriptor;
    }

    throw new Error('@timeout is applicable only on a methods.');
  };
}
