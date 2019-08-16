import {Method} from '..';
import {Refreshable} from './refreshable.model';

export function refreshable<T, D>(dataProvider: Method<D> | Method<Promise<D>>, intervalMs: number): Refreshable<T> {
  return function (target: T, key: keyof T): void {
    let data: D;

    setInterval(async () => {
      data = await dataProvider.apply(this);
    }, intervalMs);

    setTimeout(async () => {
      data = await dataProvider.apply(this);
    }, 0);

    Object.defineProperty(target, key, {
      configurable: false,
      get: () => {
        return data;
      }
    });
  };
}
