import {RateLimitable, RateLimitConfigs} from './rate-limit.model';
import {Method} from '../common/model/common.model';
import {rateLimitify} from './rate-limitify';

export function rateLimit<T = any, D = any>(config: RateLimitConfigs): RateLimitable<T, D> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor.value) {
      descriptor.value = rateLimitify(descriptor.value, config);

      return descriptor;
    }

    throw new Error('@rateLimit is applicable only on a method.');
  };
}
