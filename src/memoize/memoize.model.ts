import { AnyMethod, Method, PromiseReturnCompatible } from '../common/model/common.model';

export type KeyResolver<A extends unknown[] = unknown[]> = (...args: A) => string;

export type ResolverKey<T, A extends unknown[] = unknown[]> = {
  [K in keyof T]-?: T[K] extends (...args: A) => string ? K : never;
}[keyof T];

export interface Cache<D> {
  set: (key: string, value: D) => void;
  get: (key: string) => D | null | undefined;
  delete: (key: string) => void;
  has: (key: string) => boolean;
}

export interface MemoizeConfig<T, D, A extends unknown[] = unknown[]> {
  cache?: Cache<D>;
  keyResolver?: KeyResolver<A> | ResolverKey<T, A>;
  expirationTimeMs?: number;
}

export type Memoizable<T, D> = <F extends Method<D, any[], any>>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F>
) => TypedPropertyDescriptor<F>;

/** Validate a factory configuration once the decorated method is available. */
export type ResolverValidation<C, T, F extends AnyMethod> = 'keyResolver' extends keyof C
  ? [Exclude<C['keyResolver'], undefined>] extends [KeyResolver<Parameters<F>> | ResolverKey<T, Parameters<F>>]
    ? unknown : never
  : unknown;

type CacheValidation<C, F extends AnyMethod, Async extends boolean> = 'cache' extends keyof C
  ? [Exclude<C['cache'], undefined>] extends [Async extends true
    ? Cache<Awaited<ReturnType<F>>> | import('../memoize-async/memoize-async.model').AsyncCache<Awaited<ReturnType<F>>>
    : Cache<ReturnType<F>>]
    ? unknown : never
  : unknown;

export type ConfiguredMemoizable<C, Async extends boolean = false> = <T, F extends AnyMethod>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F>
    & ResolverValidation<C, T, F>
    & (Async extends true ? ReturnType<F> extends Promise<unknown> ? PromiseReturnCompatible<F> : never : unknown)
    & CacheValidation<C, F, Async>
) => TypedPropertyDescriptor<F>;
