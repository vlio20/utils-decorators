import { perInstance } from '../common/utils/per-instance';
import { AnyMethod } from '../common/model/common.model';
import { ConfiguredLeakyBucketable, LeakyBucketConfigs } from './leaky-bucket.model';
import { leakyBucketify } from './leaky-bucketify';

export function leakyBucket<const C extends LeakyBucketConfigs<any[]>>(config: C): ConfiguredLeakyBucketable<C> {
  return <T, F extends AnyMethod>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F>,
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      const originalMethod = descriptor.value;
      descriptor.value = perInstance(() => leakyBucketify(originalMethod, config) as F);

      return descriptor;
    }

    throw new Error('@leakyBucket is applicable only on a method.');
  };
}
