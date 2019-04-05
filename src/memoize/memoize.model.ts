import {Method} from '..';

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
