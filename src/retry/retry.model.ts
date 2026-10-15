import { AsyncDecorator, CompatibleKeys } from '../common/model/common.model';

export type RetryInput<T = unknown> = number | number[] | RetryInputConfig<T>;

export type RetryInputConfig<T = unknown> = {
  delay?: number;
  onRetry?: OnRetry | CompatibleKeys<T, [error: unknown, retriesCount: number]>;
} & (
  | { delaysArray: number[]; retries?: undefined }
  | { delaysArray?: undefined; retries?: number }
);

export type Retryable<T = unknown> = AsyncDecorator<T>;

export type OnRetry = (error: unknown, retriesCount: number) => void;
