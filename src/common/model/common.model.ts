import {Observable} from 'rxjs';

export type Method<D> = (...args: any[]) => D;
export type AsyncMethod<D> = (...args: any[]) => Promise<D>;
export type ObservableMethod<D> = (...args: any[]) => Observable<D>;

export type Decorator<T> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<Method<any>>
) => TypedPropertyDescriptor<Method<any>>;
