import { delayfy } from './delayfy';

export function delay<T extends object = object>(delayMs: number) {
  return <This extends T, A extends unknown[], R>(
    target: This,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<(this: This, ...args: A) => R>
      & ([R] extends [never] ? never : [R] extends [void] ? unknown : never),
  ): void => {
    if (descriptor?.value) {
      descriptor.value = delayfy(descriptor.value, delayMs) as (this: This, ...args: A) => R;

      return;
    }

    throw new Error('@delay is applicable only on a methods.');
  };
}
