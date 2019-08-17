import {CancelPreviousable} from './cancel-previous.model';
import {Method} from '..';

export function cancelPrevious<T, D>(): CancelPreviousable<T, D> {
  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<Promise<D>>>): TypedPropertyDescriptor<Method<Promise<D>>> => {

    if (descriptor.value != null) {
      const originalMethod = descriptor.value;
      let rej: (e: CanceledPromise) => void;

      descriptor.value = function (...args: any[]): Promise<D> {
        rej && rej(new CanceledPromise());

        return new Promise<D>((resolve, reject) => {
          rej = reject;

          originalMethod.apply(this, args)
            .then((data: D) => resolve(data))
            .catch((err) => reject(err));
        });
      }

      return descriptor;
    } else {
      throw Error('@cancelPrevious is applicable only on a methods.');
    }
  }
}

export class CanceledPromise extends Error {

  constructor() {
    super('');

    Object.setPrototypeOf(this, CanceledPromise.prototype);
  }
}
