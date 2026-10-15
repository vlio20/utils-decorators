import { throttleAsyncify } from './throttle-asyncify';

export function throttleAsync<T extends object = object, D = unknown>(parallelCalls?: number) {
  return <This extends T, A extends unknown[], R extends D>(
    target: This,
    propertyName: keyof This,
    descriptor: TypedPropertyDescriptor<(this: This, ...args: A) => Promise<R>>,
  ): void => {
    if (descriptor?.value) {
      descriptor.value = throttleAsyncify(descriptor.value, parallelCalls);

      return;
    }

    throw new Error('@throttleAsync is applicable only on a methods.');
  };
}
