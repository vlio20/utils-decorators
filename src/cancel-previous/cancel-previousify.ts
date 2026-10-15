import { CanceledPromise } from './canceled-promise';

export function cancelPreviousify<D, A extends unknown[], T>(originalMethod: (this: T, ...args: A) => Promise<D>): (this: T, ...args: A) => Promise<D> {
  let rej: (e: CanceledPromise) => void;

  return function (this: T, ...args: A): Promise<D> {
    if (rej) {
      rej(new CanceledPromise());
    }

    return new Promise<D>((resolve, reject) => {
      rej = reject;

      originalMethod.apply(this, args)
        .then((data: D) => resolve(data))
        .catch((err) => reject(err));
    });
  };
}
