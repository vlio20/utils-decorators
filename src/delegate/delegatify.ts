import { AsyncMethod, UnboxPromise } from '../common/model/common.model';

export function delegatify<M extends AsyncMethod<any>, D = UnboxPromise<ReturnType<M>>>(
  originalMethod: M,
  keyResolver?: (...args: any[]) => string,
): AsyncMethod<D, Parameters<typeof originalMethod>> {
  const delegatedKeysMap = new Map<string, Promise<any>>();
  const keyGenerator: (...args: any[]) => string = keyResolver ?? JSON.stringify;

  return function (...args: any[]): Promise<D> {
    const key = keyGenerator(...args);

    if (!delegatedKeysMap.has(key)) {
      delegatedKeysMap.set(key, originalMethod.apply(this, args).finally(() => delegatedKeysMap.delete(key)));
    }

    return delegatedKeysMap.get(key);
  };
}
