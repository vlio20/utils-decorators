import { debouncify } from './debouncify';

export function debounce<T extends object = object>(delayMs: number) {
  return <This extends T, A extends unknown[], R>(
    target: This,
    propertyName: keyof This,
    descriptor: TypedPropertyDescriptor<(this: This, ...args: A) => R>
      & ([R] extends [never] ? never : [R] extends [void] ? unknown : never),
  ): void => {
    if (descriptor?.value) {
      const methodsMap = new WeakMap<This, (this: This, ...args: A) => void>();
      const originalMethod = descriptor.value;

      const wrapped = function (this: This, ...args: A): void {
        let method = methodsMap.get(this);

        if (!method) {
          method = debouncify(originalMethod, delayMs).bind(this);
          methodsMap.set(this, method);
        }

        method.apply(this, args);
      };

      descriptor.value = wrapped as (this: This, ...args: A) => R;

      return;
    }

    throw new Error('@debounce is applicable only on a methods.');
  };
}
