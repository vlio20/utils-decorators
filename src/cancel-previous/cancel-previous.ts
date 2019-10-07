import {CancelPreviousable} from './cancel-previous.model';
import {Method} from '..';

export function cancelPrevious<T = {}>(): CancelPreviousable<T> {
  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<Promise<any>>>): TypedPropertyDescriptor<Method<Promise<any>>> => {

    if (descriptor.value) {
      const originalMethod = descriptor.value;
      let rej: (e: CanceledPromise) => void;

      descriptor.value = function (...args: any[]): Promise<any> {
        rej && rej(new CanceledPromise());

        return new Promise<any>((resolve, reject) => {
          rej = reject;

          originalMethod.apply(this, args)
            .then((data: any) => resolve(data))
            .catch((err) => reject(err));
        });
      };

      return descriptor;
    } else {
      throw new Error('@cancelPrevious is applicable only on a methods.');
    }
  };
}

export class CanceledPromise extends Error {

  constructor() {
    super('canceled');

    Object.setPrototypeOf(this, CanceledPromise.prototype);
  }
}
