import { Method, CompatibleKeys } from '../common/model/common.model';

export type RateLimitConfigs<T = unknown, A extends unknown[] = unknown[]> = {
  timeSpanMs: number;
  allowedCalls: number;
  keyResolver?: ((...args: A) => string) | CompatibleKeys<T, A, string>;
  exceedHandler?: () => void;
} & (
  | { rateLimitCounter?: RateLimitCounter; rateLimitAsyncCounter?: undefined }
  | { rateLimitCounter?: undefined; rateLimitAsyncCounter?: RateLimitAsyncCounter }
);

export interface RateLimitCounter {
  inc: (key: string) => void;
  dec: (key: string) => void;
  getCount: (key: string) => number;
}

export interface RateLimitAsyncCounter {
  inc: (key: string) => Promise<void>;
  dec: (key: string) => Promise<void>;
  getCount: (key: string) => Promise<number>;
}

export type RateLimitable<T, D> = <F extends Method<D, any[], any>>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F>
) => TypedPropertyDescriptor<F>;

export type ConfiguredRateLimitable<C> = import('../memoize/memoize.model').ConfiguredMemoizable<
  C, 'rateLimitAsyncCounter' extends keyof C
    ? [Exclude<C['rateLimitAsyncCounter'], undefined>] extends [never] ? false : true
    : false>;
