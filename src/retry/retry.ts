import { AnyMethod } from '../common/model/common.model';
import { ConfiguredRetryable, RetryInput } from './retry.model';
import { retryfy } from './retryfy';

export function retry<const C extends RetryInput<any, any>>(input: C): ConfiguredRetryable<C>;
export function retry<T = unknown>(input: RetryInput<T, any[]>): any {
  return <F extends AnyMethod>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F>,
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      descriptor.value = retryfy(descriptor.value as (this: T, ...args: any[]) => Promise<any>, input) as F;

      return descriptor;
    }

    throw new Error('@retry is applicable only on a methods.');
  };
}
