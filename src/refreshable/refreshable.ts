import {Refreshable, RefreshableConfig} from './refreshable.model';

export function refreshable<T = any, D = any>(config: RefreshableConfig<D>): Refreshable<T> {
  return async function (target: T, key: keyof T): Promise<void> {
    let data: D;

    const intervalHandler = setInterval(async () => {
      data = await config.dataProvider.apply(this);
    }, config.intervalMs);

    if (typeof intervalHandler.unref === 'function') {
      intervalHandler.unref();
    }

    setTimeout(async () => {
      data = await config.dataProvider.apply(this);
    }, 0);

    Object.defineProperty(target, key, {
      get: (): D => data,
      set(x: D): void {
        if (x === null) {
          clearInterval(intervalHandler);
        }
      },
    });
  };
}
