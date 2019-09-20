import {Readonlyable} from './readonly.model';

export function readonly<T extends any>(): Readonlyable<T> {

  return (target: T, key: keyof T, descriptor: PropertyDescriptor): PropertyDescriptor => {
    descriptor.writable = false;

    return descriptor;
  }
}
