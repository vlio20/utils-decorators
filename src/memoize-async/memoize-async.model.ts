import {Memoizable, MemoizeConfig, Method} from '..';

export type AsyncMethod<D> = Method<Promise<D>>;
export type MemoizeAsyncConfig<D> = MemoizeConfig<Promise<D>>;
export type AsyncMemoizable<D> = Memoizable<Promise<D>>;
