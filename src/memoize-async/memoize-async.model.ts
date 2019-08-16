import {Memoizable, MemoizeConfig, Method} from '..';

export type AsyncMethod<D> = Method<Promise<D>>;
export type MemoizeAsyncConfig<T, D> = MemoizeConfig<T, D>;
export type AsyncMemoizable<T, D> = Memoizable<T, Promise<D>>;
