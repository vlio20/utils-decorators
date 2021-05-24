import { Delegatable } from './delegate.model';
import { AsyncMethod } from '../common/model/common.model';
import { delegatify } from './delegatify';

export function delegate<T = any, D = any>(keyResolver?: (...args: any[]) => string): Delegatable<T, D> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<D>>,
  ): TypedPropertyDescriptor<AsyncMethod<any>> => {
    if (descriptor.value) {
      descriptor.value = delegatify(descriptor.value, keyResolver);

      return descriptor;
    }

    throw new Error('@delegate is applicable only on a methods.');
  };
}
