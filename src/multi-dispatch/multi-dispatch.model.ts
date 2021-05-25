import { AsyncMethod } from '../common/model/common.model';

export type MultiDispatchable<T> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<AsyncMethod<any>>,
) => TypedPropertyDescriptor<AsyncMethod<any>>;
