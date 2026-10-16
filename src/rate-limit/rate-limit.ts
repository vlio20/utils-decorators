import { perInstance } from '../common/utils/per-instance';
import { RateLimitConfigs, ConfiguredRateLimitable } from './rate-limit.model';
import { AnyMethod } from '../common/model/common.model';
import { rateLimitify } from './rate-limitify';

export function rateLimit<const C extends RateLimitConfigs<any, any[]>>(config: C): ConfiguredRateLimitable<C>;
export function rateLimit<T = unknown>(config: RateLimitConfigs<T, any[]>): any {
  return <F extends AnyMethod>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F>,
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      const originalMethod = descriptor.value;
      descriptor.value = perInstance(() => rateLimitify(originalMethod as (this: T, ...args: any[]) => unknown, config) as F);

      return descriptor;
    }

    throw new Error('@rateLimit is applicable only on a method.');
  };
}
