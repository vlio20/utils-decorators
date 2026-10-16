import { AnyMethod, AsyncReturnValidation, ConfigProperty } from '../common/model/common.model';
import type { LeakyBucket } from './leaky-bucket-executor';

export interface LeakyBucketOptions {
  timeSpanMs: number;
  allowedCalls: number;
  maxQueueSize?: number;
}

export type LeakyBucketConfigs<A extends unknown[] = unknown[]> = {
  signalResolver?: (...args: A) => AbortSignal | undefined;
} & (
  | (LeakyBucketOptions & { bucket?: undefined })
  | { bucket: LeakyBucket; timeSpanMs?: never; allowedCalls?: never; maxQueueSize?: never }
);

export type ConfiguredLeakyBucketable<C> = <T, F extends AnyMethod>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F>
    & AsyncReturnValidation<F>
    & ([ConfigProperty<C, 'signalResolver'>] extends [(...args: Parameters<F>) => AbortSignal | undefined] ? unknown : never)
) => TypedPropertyDescriptor<F>;
