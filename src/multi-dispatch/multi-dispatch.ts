import { AsyncMethod } from '../common/model/common.model';
import { MultiDispatchable } from './multi-dispatch.model';
import { multiDispatchify } from './multi-dispatchify';

export function multiDispatch<T = any>(dispatchesAmount: number): MultiDispatchable<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<any>>,
  ): TypedPropertyDescriptor<AsyncMethod<any>> => {
    if (descriptor && descriptor.value) {
      descriptor.value = multiDispatchify(descriptor.value, dispatchesAmount);

      return descriptor;
    }

    throw new Error('@multiDispatch is applicable only on a methods.');
  };
}
