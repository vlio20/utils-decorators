import { Method } from '../common/model/common.model';
import { OnErrorable, OnErrorConfig } from './on-error.model';
import { onErrorify } from './on-errorify';

export function onError<T>(config: OnErrorConfig<T>): OnErrorable<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor && descriptor.value) {
      descriptor.value = onErrorify(descriptor.value, config);

      return descriptor;
    }

    throw new Error('@onError is applicable only on a methods.');
  };
}
