import { AsyncMethod } from '../common/model/common.model';
import { Retryable, RetryInput } from './retry.model';
import { retryfy } from './retryfy';

export function retry<T = any>(input: RetryInput): Retryable<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<any>>,
  ): TypedPropertyDescriptor<AsyncMethod<any>> => {
    if (descriptor.value) {
      descriptor.value = retryfy(descriptor.value, input);

      return descriptor;
    }

    throw new Error('@retry is applicable only on a methods.');
  };
}
