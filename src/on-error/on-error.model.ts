import {Method} from '..';

export type OnErrorable<T> = (target: T,
                              propertyName: keyof T,
                              descriptor: TypedPropertyDescriptor<Method<any>>) => TypedPropertyDescriptor<Method<any>>;

export interface OnErrorConfig<T> {
  func: Function | keyof T;
  wait?: boolean;
}

export type OnErrorHandler = (e?: Error, args?: any[]) => any;
