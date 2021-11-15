import { AsyncMethod } from '../common/model/common.model';
import { TimeoutError } from './timeout-error';

export function timeoutify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>, ms: number): AsyncMethod<D, A> {
  return function (...args: A): Promise<D> {
    return new Promise((resolve, reject) => {
      originalMethod.apply(this, args).then((data: any) => {
        resolve(data);
      });

      setTimeout(() => {
        reject(new TimeoutError(ms));
      }, ms);
    });
  };
}
