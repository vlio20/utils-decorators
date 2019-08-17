import {Method} from '..';
import {Refreshable} from './refreshable.model';

export function refreshable<T, D>(dataProvider: Method<D> | Method<Promise<D>>, intervalMs: number): Refreshable<T> {
  return async function (target: T, key: keyof T): Promise<void> {
    let data: D = await dataProvider();

    setInterval(async () => {
      data = await dataProvider.apply(this);
    }, intervalMs);

    setTimeout(async () => {
      data = await dataProvider.apply(this);
    }, 0);

    Object.defineProperty(target, key, {
      configurable: false,
      get: (): D => {
        return data;
      }
    });
  };
}
