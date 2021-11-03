import { AsyncMethod } from '../common/model/common.model';
import { TimeoutError } from './timeout-error';

export function timeoutify<M extends AsyncMethod<any>>(originalMethod: M, ms: number): M {
  return function (...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      originalMethod.apply(this, args).then((data: any) => {
        resolve(data);
      });

      setTimeout(() => {
        reject(new TimeoutError(ms));
      }, ms);
    });
  } as M;
}
