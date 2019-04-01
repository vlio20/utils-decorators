import {Method} from '../common/model/common.model';

export type KeyResolver = (...args: any[]) => string;

export interface Cache<D> {
  set: (key: string, value: D) => void;
  get: (key: string) => D | null;
  delete: (key: string) => void;
  has: (key: string) => boolean;
}

export interface MemoizeConfig<D> {
  cache?: Cache<D>;
  keyResolver?: KeyResolver;
  expirationTimeMs: number;
}

export type Memoizable<D> = (target: any,
                             propertyName: string,
                             descriptor: TypedPropertyDescriptor<Method<D>>) => TypedPropertyDescriptor<Method<D>>;

export type AsyncMethod<D> = Method<Promise<D>>;
export type MemoizeAsyncConfig<D> = MemoizeConfig<Promise<D>>;
export type AsyncMemoizable<D> = Memoizable<Promise<D>>;
