import { Refreshable, RefreshableConfig } from './refreshable.model';

export function refreshable<T extends object = object, D = unknown>(config: RefreshableConfig<D>): Refreshable<T, D> {
  return (target, key): void => {
    let data: D | undefined;

    const intervalHandler = setInterval(async () => {
      data = await config.dataProvider.call(undefined);
    }, config.intervalMs);

    if (typeof intervalHandler.unref === 'function') {
      intervalHandler.unref();
    }

    setTimeout(async () => {
      data = await config.dataProvider.call(undefined);
    }, 0);

    Object.defineProperty(target, key, {
      get: (): D | undefined => data,
      set(x: D | null | undefined): void {
        if (x === null) {
          clearInterval(intervalHandler);
        }
      },
    });
  };
}
