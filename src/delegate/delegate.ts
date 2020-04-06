import {Delegatable} from './delegate.model';
import {memoizeAsync} from '../memoize-async/memoize-async';

export function delegate<T = any>(keyResolver?: (...args: any[]) => string): Delegatable<T> {
  try {
    return memoizeAsync({
      keyResolver,
      expirationTimeMs: 0,
    });
  } catch (e) {
    if (e.message === '@memoizeAsync is applicable only on a methods.') {
      throw new Error('@delegate is applicable only on a methods.')
    }

    throw e;
  }
}
