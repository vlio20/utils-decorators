import {AsyncMethod} from '../common/model/common.model';
import {Timeoutable} from './timeout.model';
import {timeoutify} from './timeoutify';

export function timeout<T = any>(ms: number): Timeoutable<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<any>>,
  ): TypedPropertyDescriptor<AsyncMethod<any>> => {
    if (descriptor.value) {
      descriptor.value = timeoutify(descriptor.value, ms);

      return descriptor;
    }

    throw new Error('@timeout is applicable only on a methods.');
  };
}
