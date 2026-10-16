import { perInstance } from '../common/utils/per-instance';
import { throttlify } from './throttlify';

export function throttle<T extends object = object>(delayMs: number) {
  return <This extends T, A extends unknown[], R>(
    target: This,
    propertyName: keyof This,
    descriptor: TypedPropertyDescriptor<(this: This, ...args: A) => R>
      & ([R] extends [never] ? never : [R] extends [void] ? unknown : never),
  ): void => {
    if (descriptor?.value) {
      const originalMethod = descriptor.value;
      descriptor.value = perInstance(() => throttlify(originalMethod, delayMs) as (this: This, ...args: A) => R);

      return;
    }

    throw new Error('@throttle is applicable only on a methods.');
  };
}
