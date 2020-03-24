import {Refreshable, RefreshableConfig} from './refreshable.model';

export function refreshable<T, D>(config: RefreshableConfig<D>): Refreshable<T> {
  return async function (target: T, key: keyof T): Promise<void> {
    let data: D;

    const intervalHandler = setInterval(async () => {
      data = await config.dataProvider.apply(this);
    }, config.intervalMs);

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
