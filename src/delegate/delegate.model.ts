import { AsyncMethod } from '../common/model/common.model';

export type Delegatable<T = unknown, D = unknown> = <A extends unknown[]>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<AsyncMethod<D, A>>
) => TypedPropertyDescriptor<AsyncMethod<D, A>>;
