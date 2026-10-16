import { AsyncMethod } from '../common/model/common.model';

export function delegatify<D, A extends unknown[], This>(
  originalMethod: AsyncMethod<D, A, This>,
  keyResolver?: (...args: NoInfer<A>) => string,
): AsyncMethod<D, A, This> {
  const delegatedKeysMap = new Map<string, Promise<D>>();
  const keyGenerator: (...args: any[]) => string = keyResolver ?? ((...args) => JSON.stringify(args));

  return function (this: This, ...args: A): Promise<D> {
    const key = keyGenerator(...args);

    let promise = delegatedKeysMap.get(key);

    if (!promise) {
      promise = originalMethod.apply(this, args).finally(() => delegatedKeysMap.delete(key));
      delegatedKeysMap.set(key, promise);
    }

    return promise;
  };
}
