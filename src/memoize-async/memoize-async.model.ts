import {Memoizable, MemoizeConfig, Method} from '..';

export type AsyncMethod<D> = Method<Promise<D>>;
export type MemoizeAsyncConfig<D> = MemoizeConfig<D>;
export type AsyncMemoizable<T, D> = Memoizable<T, Promise<D>>;
