import {KeyResolver, Memoizable} from '../memoize/memoize.model';
import {Observable} from 'rxjs';

export type RxMemoizable<T, D> = Memoizable<T, Observable<D>>;

export interface RxCache<D> {
  set: (key: string, value: Observable<D>) => RxCache<D>;
  get: (key: string) => Observable<D> | undefined;
  delete: (key: string) => boolean;
  has: (key: string) => boolean;
}

export interface RxMemoizeConfig<T, D> {
  cache?: RxCache<D>;
  keyResolver?: KeyResolver | keyof T;
  expirationTimeMs?: number;
}
