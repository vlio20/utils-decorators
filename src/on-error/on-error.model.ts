import {Method} from '../common/model/common.model';

export type OnErrorable<T> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<Method<any>>
) => TypedPropertyDescriptor<Method<any>>;

export interface OnErrorConfig<T> {
  func: Function | keyof T;
}

export type OnErrorHandler = (e?: Error, args?: any[]) => any;
