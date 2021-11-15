import { AsyncMethod } from '../common/model/common.model';
import { CanceledPromise } from './canceled-promise';

export function cancelPreviousify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>): AsyncMethod<D, A> {
  let rej: (e: CanceledPromise) => void;

  return function (...args: A): Promise<D> {
    if (rej) {
      rej(new CanceledPromise());
    }

    return new Promise<D>((resolve, reject) => {
      rej = reject;

      originalMethod.apply(this, args)
        .then((data: any) => resolve(data))
        .catch((err) => reject(err));
    });
  };
}
