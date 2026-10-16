import { AsyncDecorator } from '../common/model/common.model';
import { multiDispatchify } from './multi-dispatchify';

export function multiDispatch<T = unknown>(dispatchesAmount: number): AsyncDecorator<T> {
  return (target, propertyName, descriptor) => {
    if (descriptor?.value) {
      descriptor.value = multiDispatchify(descriptor.value, dispatchesAmount) as typeof descriptor.value;

      return descriptor;
    }

    throw new Error('@multiDispatch is applicable only on a methods.');
  };
}
