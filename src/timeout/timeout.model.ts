import {AsyncMethod} from '../common/model/common.model';

export type Timeoutable<T> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<AsyncMethod<any>>
) => TypedPropertyDescriptor<AsyncMethod<any>>;
