import { AsyncDecorator, CompatibleKeys, AnyMethod, ConfigProperty, AsyncReturnValidation } from '../common/model/common.model';

export type RetryInput<T = unknown, A extends unknown[] = unknown[]> = number | number[] | RetryInputConfig<T, A>;

export type RetryInputConfig<T = unknown, A extends unknown[] = unknown[]> = {
  delay?: number;
  onRetry?: OnRetry<A> | CompatibleKeys<T, [error: unknown, retriesCount: number, args: A]>;
} & (
  | { delaysArray: number[]; retries?: undefined }
  | { delaysArray?: undefined; retries?: number }
);

export type Retryable<T = unknown> = AsyncDecorator<T>;

export type OnRetry<A extends unknown[] = unknown[]> = (error: unknown, retriesCount: number, args: A) => void;

export type ConfiguredRetryable<C> = <T, F extends AnyMethod>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F> & AsyncReturnValidation<F>
    & ([ConfigProperty<C, 'onRetry'>] extends [OnRetry<Parameters<F>> | CompatibleKeys<T, [unknown, number, Parameters<F>]>]
      ? unknown : never)
) => TypedPropertyDescriptor<F>;
