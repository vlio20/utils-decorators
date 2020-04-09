import {Delegatable} from './delegate.model';
import {AsyncMethod} from '../common/model/common.model';

export function delegate<T = any>(keyResolver?: (...args: any[]) => string): Delegatable<T> {
  const delegatedKeysMap = new Map<string, Promise<any>>();
  const keyGenerator: (...args: any[]) => string = keyResolver ?? JSON.stringify;

  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<any>>,
  ): TypedPropertyDescriptor<AsyncMethod<any>> => {
    if (descriptor.value) {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: any[]): Promise<any> {
        const key = keyGenerator(...args);

        if (!delegatedKeysMap.has(key)) {
          delegatedKeysMap.set(key, originalMethod.apply(this, args).finally(() => delegatedKeysMap.delete(key)));
        }

        return delegatedKeysMap.get(key);
      };

      return descriptor;
    }

    throw new Error('@delegate is applicable only on a methods.');
  };
}
