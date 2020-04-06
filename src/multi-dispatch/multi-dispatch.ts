import {Method} from '../common/model/common.model';
import {MultiDispatchable} from './multi-dispatch.model';

export function multiDispatch<T = any>(dispatchesAmount: number): MultiDispatchable<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<Promise<any>>>,
  ): TypedPropertyDescriptor<Method<Promise<any>>> => {
    if (descriptor.value) {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
          let rejectionsAmount = 0;

          const catchHandler = (e: Error) => {
            rejectionsAmount += 1;
            console.log(rejectionsAmount, dispatchesAmount, e.message);

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

      return descriptor;
    }

    throw new Error('@multiDispatch is applicable only on a methods.');
  };
}
