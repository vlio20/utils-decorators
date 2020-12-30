import {AsyncMethod} from '../common/model/common.model';

export function delegatify<D>(
  originalMethod: AsyncMethod<D>,
  keyResolver?: (...args: any[]) => string,
): AsyncMethod<D> {
  const delegatedKeysMap = new Map<string, Promise<any>>();
  const keyGenerator: (...args: any[]) => string = keyResolver ?? JSON.stringify;

  return function (...args: any[]): Promise<D> {
    const key = keyGenerator(...args);

    if (!delegatedKeysMap.has(key)) {
      delegatedKeysMap.set(key, originalMethod(...args).finally(() => delegatedKeysMap.delete(key)));
    }

    return delegatedKeysMap.get(key);
  };
}
