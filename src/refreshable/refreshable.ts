import {Method} from '..';
import {Refreshable} from './refreshable.model';

export function refreshable<D>(dataProvider?: Method<D> | Method<Promise<D>>,
                               intervalMs?: number): Refreshable {
  return function (target: Object, key: string): void {
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
