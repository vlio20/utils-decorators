import { TimeoutError } from './timeout-error';

export function timeoutify<D, A extends unknown[], T>(originalMethod: (this: T, ...args: A) => Promise<D>, ms: number): (this: T, ...args: A) => Promise<D> {
  return function (this: T, ...args: A): Promise<D> {
    return new Promise((resolve, reject) => {
      originalMethod.apply(this, args).then((data: D) => {
        resolve(data);
      }).catch(reject);

      setTimeout(() => {
        reject(new TimeoutError(ms));
      }, ms);
    });
  };
}
