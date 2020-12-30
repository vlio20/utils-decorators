import {AsyncMethod} from '../common/model/common.model';
import {CanceledPromise} from './canceled-promise';

export function cancelPreviousify<D>(originalMethod: AsyncMethod<D>): AsyncMethod<D> {
  let rej: (e: CanceledPromise) => void;

  return function (...args: any[]): Promise<D> {
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
