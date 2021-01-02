import {AfterConfig} from './after.model';
import {Decorator, Method} from '../common/model/common.model';
import {afterify} from './afterify';

export function after<T = any, D = any>(config: AfterConfig<T, D>): Decorator<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor.value) {
      descriptor.value = afterify(descriptor.value, config);

      return descriptor;
    }
    throw new Error('@after is applicable only on a methods.');
  };
}
