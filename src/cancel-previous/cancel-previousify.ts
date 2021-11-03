import { AsyncMethod } from '../common/model/common.model';
import { CanceledPromise } from './canceled-promise';

export function cancelPreviousify<M extends AsyncMethod<any>>(originalMethod: M): M {
  let rej: (e: CanceledPromise) => void;

  return function (...args: any[]): Promise<any> {
    if (rej) {
      rej(new CanceledPromise());
    }

    return new Promise<any>((resolve, reject) => {
      rej = reject;

      originalMethod.apply(this, args)
        .then((data: any) => resolve(data))
        .catch((err) => reject(err));
    });
  } as M;
}
