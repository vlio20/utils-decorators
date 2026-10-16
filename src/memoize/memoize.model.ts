import { AnyMethod, Method, CompatibleKeys, ConfigProperty, ResolverValidation, AsyncReturnValidation } from '../common/model/common.model';

export type KeyResolver<A extends unknown[] = unknown[]> = (...args: A) => string;

export type ResolverKey<T, A extends unknown[] = unknown[]> = CompatibleKeys<T, A, string>;

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

export type { ResolverValidation } from '../common/model/common.model';

type CacheValidation<C, F extends AnyMethod, Async extends boolean> = [ConfigProperty<C, 'cache'>] extends [Async extends true
  ? Cache<Awaited<ReturnType<F>>> | import('../memoize-async/memoize-async.model').AsyncCache<Awaited<ReturnType<F>>>
  : Cache<ReturnType<F>>]
  ? unknown : never;

export type ConfiguredMemoizable<C, Async extends boolean = false> = <T, F extends AnyMethod>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F>
    & ResolverValidation<C, T, F>
    & (Async extends true ? AsyncReturnValidation<F> : unknown)
    & CacheValidation<C, F, Async>
) => TypedPropertyDescriptor<F>;
