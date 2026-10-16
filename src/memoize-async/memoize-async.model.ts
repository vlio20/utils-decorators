import { AsyncMethod, PromiseReturnCompatible } from '../common/model/common.model';
import { Cache, KeyResolver, ResolverKey } from '../memoize/memoize.model';

export type AsyncMemoizable<T, D> = <F extends AsyncMethod<D, any[], any>>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F> & PromiseReturnCompatible<F>
) => TypedPropertyDescriptor<F>;

export interface AsyncCache<D> {
  set: (key: string, value: D) => Promise<void>;
  get: (key: string) => Promise<D | null | undefined>;
  delete: (key: string) => Promise<void>;
  has: (key: string) => Promise<boolean>;
}

export interface AsyncMemoizeConfig<T, D, A extends unknown[] = unknown[]> {
  cache?: Cache<D> | AsyncCache<D>;
  keyResolver?: KeyResolver<A> | ResolverKey<T, A>;
  expirationTimeMs?: number;
}
