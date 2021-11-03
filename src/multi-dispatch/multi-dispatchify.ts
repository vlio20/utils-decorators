import { AsyncMethod } from '../common/model/common.model';

export function multiDispatchify<M extends AsyncMethod<any>>(originalMethod: M, dispatchesAmount: number): M {
  return function (...args: any[]): Promise<any> {
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
  } as M;
}
