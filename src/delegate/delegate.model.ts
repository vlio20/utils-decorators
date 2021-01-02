import {AsyncMethod} from '../common/model/common.model';

export type Delegatable<T, D> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<AsyncMethod<D>>
) => TypedPropertyDescriptor<AsyncMethod<D>>;
