import { perInstance } from '../common/utils/per-instance';
import { AsyncMethod, PromiseReturnCompatible } from '../common/model/common.model';
import { delegatify } from './delegatify';

export function delegate<T = unknown, A extends unknown[] = unknown[]>(keyResolver?: (...args: A) => string) {
  return <F extends AsyncMethod<any, any[], any>>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F> & PromiseReturnCompatible<F> & (Parameters<F> extends A ? unknown : never),
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      const originalMethod = descriptor.value;
      descriptor.value = perInstance(() => delegatify(originalMethod, keyResolver as ((...args: any[]) => string) | undefined) as F);
      return descriptor;
    }
    throw new Error('@delegate is applicable only on a methods.');
  };
}
