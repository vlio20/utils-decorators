import { LeakyBucket } from './leaky-bucket-executor';
import { LeakyBucketConfigs } from './leaky-bucket.model';

export function leakyBucketify<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => Promise<D>,
  config: NoInfer<LeakyBucketConfigs<A>>,
): (this: T, ...args: A) => Promise<D> {
  const bucket = config.bucket ?? new LeakyBucket(config);
  const { signalResolver } = config;

  return function (this: T, ...args: A): Promise<D> {
    try {
      const signal = signalResolver?.apply(this, args);
      return bucket.exec(() => originalMethod.apply(this, args), signal);
    } catch (error) {
      return Promise.reject(error);
    }
  };
}
