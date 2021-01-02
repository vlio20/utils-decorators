import {BeforeConfig} from './before.model';
import {Decorator, Method} from '../common/model/common.model';
import {beforify} from './beforify';

export function before<T = any>(config: BeforeConfig<T>): Decorator<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor.value) {
      descriptor.value = beforify(descriptor.value, config);

      return descriptor;
    }
    throw new Error('@before is applicable only on a methods.');
  };
}
