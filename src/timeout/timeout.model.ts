import {Method} from '../common/model/common.model';

export type Timeoutable<T> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<Method<any>>
) => TypedPropertyDescriptor<Method<any>>;
