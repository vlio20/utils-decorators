import { Readonlyable } from './readonly.model';

export function readonly<T extends object = object>(): Readonlyable<T> {
  function decorate(target: T, key: string | symbol): void;
  function decorate<Value>(
    target: T,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<Value>,
  ): TypedPropertyDescriptor<Value>;
  function decorate<Value>(
    target: T,
    key: string | symbol,
    descriptor?: TypedPropertyDescriptor<Value>,
  ): TypedPropertyDescriptor<Value> | void {
    if (!descriptor) {
      Object.defineProperty(target, key, {
        configurable: true,
        set(value: unknown) {
          Object.defineProperty(this, key, {
            value,
            writable: false,
            enumerable: true,
            configurable: true,
          });
        },
      });

      return;
    }

    descriptor.writable = false;

    return descriptor;
  }

  return decorate;
}
