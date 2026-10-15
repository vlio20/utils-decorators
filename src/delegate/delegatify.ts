import { AsyncMethod } from '../common/model/common.model';

export function delegatify<D = any, A extends any[] = any[]>(
  originalMethod: AsyncMethod<D, A>,
  keyResolver?: (...args: A) => string,
): AsyncMethod<D, A> {
  const delegatedKeysMap = new Map<string, Promise<D>>();
  const keyGenerator: (...args: any[]) => string = keyResolver ?? ((...args) => JSON.stringify(args));

  return function (this: unknown, ...args: A): Promise<D> {
    const key = keyGenerator(...args);

    let promise = delegatedKeysMap.get(key);
    if (!promise) {
      promise = originalMethod.apply(this, args).finally(() => delegatedKeysMap.delete(key));
      delegatedKeysMap.set(key, promise);
    }

    return promise;
  };
}
