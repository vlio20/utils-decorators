import { AsyncMethod } from '../common/model/common.model';
import { TimeoutError } from './timeout-error';

export function timeoutify<D>(originalMethod: AsyncMethod<D>, ms: number): AsyncMethod<D> {
  return function (...args: any[]): Promise<any> {
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
