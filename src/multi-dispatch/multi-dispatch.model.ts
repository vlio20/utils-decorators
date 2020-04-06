import {Method} from '../common/model/common.model';

export type MultiDispatchable<T> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<Method<Promise<any>>>
) => TypedPropertyDescriptor<Method<Promise<any>>>;
