import {Memoizable, MemoizeConfig} from '..';
import {Method} from '../common/model/common.model';

export type AsyncMethod<D> = Method<Promise<D>>;
export type MemoizeAsyncConfig<D> = MemoizeConfig<Promise<D>>;
export type AsyncMemoizable<D> = Memoizable<Promise<D>>;
