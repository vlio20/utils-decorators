import { AsyncMethod } from '../common/model/common.model';

export function multiDispatchify<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>, dispatchesAmount: number): AsyncMethod<D, A> {
  return function (...args: A): Promise<D> {
    return new Promise((resolve, reject) => {
      let rejectionsAmount = 0;

      const catchHandler = (e: Error) => {
        rejectionsAmount += 1;

        if (rejectionsAmount === dispatchesAmount) {
          reject(e);
        }
      };

      for (let i = 1; i <= dispatchesAmount; i += 1) {
        originalMethod.apply(this, ...args)
          .then(resolve)
          .catch(catchHandler);
      }
    });
  };
}
