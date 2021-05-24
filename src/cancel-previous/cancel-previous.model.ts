import { Method } from '../common/model/common.model';

export type CancelPreviousable<T = any> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<Method<Promise<any>>>) => TypedPropertyDescriptor<Method<Promise<any>>>;
