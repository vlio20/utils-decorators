import { Cache, KeyResolver, Memoizable } from '../memoize/memoize.model';

export type AsyncMemoizable<T, D> = Memoizable<T, Promise<D>>;

export interface AsyncCache<D> {
  set: (key: string, value: D) => Promise<void>;
  get: (key: string) => Promise<D> | Promise<null>;
  delete: (key: string) => Promise<void>;
  has: (key: string) => Promise<boolean>;
}

export interface AsyncMemoizeConfig<T, D> {
  cache?: Cache<D> | AsyncCache<D>;
  keyResolver?: KeyResolver | keyof T;
  expirationTimeMs?: number;
  hotCache?: boolean;
}
