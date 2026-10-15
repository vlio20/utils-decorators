export function readonly<T = any>(): any {
  return (target: T, key: keyof T, descriptor?: PropertyDescriptor): PropertyDescriptor | void => {
    if (!descriptor) {
      Object.defineProperty(target, key, {
        configurable: true,
        set(value: any) {
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
  };
}
