import {AsyncMethod} from '../common/model/common.model';

export type RetryInput = number | number[] | {
  retries: number;
  delay: number;
};

export type Retryable<T> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<AsyncMethod<any>>
) => TypedPropertyDescriptor<AsyncMethod<any>>;
