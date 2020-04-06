import {AsyncMethod} from '../common/model/common.model';
import {Timeoutable} from './timeout.model';

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`timeout occurred after ${ms}`);

    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export function timeout<T = any>(ms: number): Timeoutable<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<any>>,
  ): TypedPropertyDescriptor<AsyncMethod<any>> => {
    if (descriptor.value) {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
          originalMethod.apply(this, args).then((data: any) => {
            resolve(data);
          });

          setTimeout(() => {
            reject(new TimeoutError(ms));
          }, ms);
        });
      };

      return descriptor;
    }

    throw new Error('@timeout is applicable only on a methods.');
  };
}
