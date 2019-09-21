export function readonly<T extends any>(): any {

  return (target: T, key: keyof T, descriptor: PropertyDescriptor): PropertyDescriptor => {
    descriptor.writable = false;

    return descriptor;
  };
}
