import { AsyncMethod } from '../common/model/common.model';

export type RetryInput = number | number[] | RetryInputConfig;

export interface RetryInputConfig {
  retries: number;
  delay: number;
  onRetry?: OnRetry | string;
}

export type Retryable<T> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<AsyncMethod<any>>
) => TypedPropertyDescriptor<AsyncMethod<any>>;

export type OnRetry = (error: Error, retriesCount: number) => void;
