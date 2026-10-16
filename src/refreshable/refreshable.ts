import { Refreshable, RefreshableConfig } from './refreshable.model';

interface RefreshState<D> {
  data: D | undefined;
  started: boolean;
  stopped: boolean;
  intervalHandler?: ReturnType<typeof setInterval>;
}

/** Load on the first read and refresh independently for each instance. Assign null to stop. */
export function refreshable<T extends object = object, D = unknown>(config: RefreshableConfig<D>): Refreshable<T, D> {
  return (target, key): void => {
    const states = new WeakMap<object, RefreshState<D>>();

    const getState = (receiver: object): RefreshState<D> => {
      let state = states.get(receiver);

      if (!state) {
        state = { data: undefined, started: false, stopped: false };
        states.set(receiver, state);
      }

      return state;
    };

    const start = (receiver: object): RefreshState<D> => {
      const state = getState(receiver);

      if (state.started || state.stopped) {
        return state;
      }

      state.started = true;
      state.intervalHandler = setInterval(async () => {
        state.data = await config.dataProvider.call(undefined);
      }, config.intervalMs);

      if (typeof state.intervalHandler.unref === 'function') {
        state.intervalHandler.unref();
      }

      // Stopping the interval does not cancel the initial or in-flight refresh.
      setTimeout(async () => {
        state.data = await config.dataProvider.call(undefined);
      }, 0);

      return state;
    };

    Object.defineProperty(target, key, {
      get(this: object): D | undefined {
        return start(this).data;
      },
      set(this: object, value: D | null | undefined): void {
        if (value === null) {
          const state = getState(this);
          state.stopped = true;

          if (state.intervalHandler !== undefined) {
            clearInterval(state.intervalHandler);
          }
        }
      },
    });
  };
}
