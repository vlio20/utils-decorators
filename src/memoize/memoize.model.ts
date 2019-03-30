export type KeyResolver = (...args: any[]) => string;
export type AsyncMethod<D> = (...args: any[]) => Promise<D>;

export interface GetterSetter<D> {
  set: (key: string, value: Promise<D>) => void;
  get: (key: string) => Promise<D> | null;
  delete: (key: string) => void;
  has: (key: string) => boolean;
}

export interface MemoizeAsyncConfig<D> {
  cache?: GetterSetter<D>;
  keyResolver?: KeyResolver;
  expirationTimeMs: number;
}

export type Memoizable<D> = (target: any,
                             propertyName: string,
                             descriptor: TypedPropertyDescriptor<AsyncMethod<D>>) => TypedPropertyDescriptor<AsyncMethod<D>>
