import { refreshable } from './refreshable';

describe('refreshable', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('starts only on the first read, then populates and refreshes the property', async () => {
    const provider = jest.fn<Promise<number>, []>()
      .mockResolvedValueOnce(3)
      .mockResolvedValue(4);
    class Monitor {
      @refreshable({ dataProvider: provider, intervalMs: 50 })
      declare value: number | null | undefined;
    }
    const monitor = new Monitor();

    await jest.advanceTimersByTimeAsync(100);
    expect(provider).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);

    expect(monitor.value).toBeUndefined();
    expect(monitor.value).toBeUndefined();
    expect(jest.getTimerCount()).toBe(2);
    await jest.advanceTimersByTimeAsync(0);
    expect(monitor.value).toBe(3);
    expect(provider).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(50);
    expect(monitor.value).toBe(4);
    expect(provider).toHaveBeenCalledTimes(2);
  });

  it('unrefs the interval when first read, if supported', () => {
    const unref = jest.fn();
    jest.spyOn(global, 'setInterval').mockReturnValue({ unref } as unknown as ReturnType<typeof setInterval>);
    const target = { value: undefined as number | undefined };
    refreshable({ dataProvider: async () => 0, intervalMs: 50 })(target, 'value');

    expect(unref).not.toHaveBeenCalled();
    expect(target.value).toBeUndefined();
    expect(unref).toHaveBeenCalledTimes(1);
  });

  it('keeps values and refresh timers independent across instances', async () => {
    const provider = jest.fn<Promise<number>, []>()
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValue(3);
    class Monitor {
      @refreshable({ dataProvider: provider, intervalMs: 50 })
      declare value: number | null | undefined;
    }
    const first = new Monitor();
    const second = new Monitor();

    expect(first.value).toBeUndefined();
    await jest.advanceTimersByTimeAsync(0);
    expect(first.value).toBe(1);
    expect(second.value).toBeUndefined();
    await jest.advanceTimersByTimeAsync(0);
    expect(second.value).toBe(2);
    expect(first.value).toBe(1);

    first.value = null;
    await jest.advanceTimersByTimeAsync(50);
    expect(first.value).toBe(1);
    expect(second.value).toBe(3);
    expect(provider).toHaveBeenCalledTimes(3);

    second.value = null;
    await jest.advanceTimersByTimeAsync(100);
    expect(provider).toHaveBeenCalledTimes(3);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('can stop before the first read without starting or restarting timers', async () => {
    const provider = jest.fn(async () => 1);
    const target = { value: undefined as number | null | undefined };
    refreshable({ dataProvider: provider, intervalMs: 50 })(target, 'value');

    target.value = null;
    expect(target.value).toBeUndefined();
    target.value = 100;
    expect(target.value).toBeUndefined();
    await jest.advanceTimersByTimeAsync(100);
    expect(provider).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  it('ignores ordinary assignments without starting work or replacing data', async () => {
    const target = { value: undefined as number | null | undefined };
    refreshable({ dataProvider: async () => 3, intervalMs: 50 })(target, 'value');

    target.value = 100;
    expect(jest.getTimerCount()).toBe(0);
    expect(target.value).toBeUndefined();
    await jest.advanceTimersByTimeAsync(0);
    target.value = undefined;
    expect(target.value).toBe(3);
    target.value = 100;
    expect(target.value).toBe(3);
  });

  it('allows an in-flight refresh to finish after stopping', async () => {
    let finish!: (value: number) => void;
    const provider = jest.fn(() => new Promise<number>(resolve => { finish = resolve; }));
    const target = { value: undefined as number | null | undefined };
    refreshable({ dataProvider: provider, intervalMs: 50 })(target, 'value');

    expect(target.value).toBeUndefined();
    await jest.advanceTimersByTimeAsync(0);
    target.value = null;
    finish(7);
    await Promise.resolve();
    expect(target.value).toBe(7);
    await jest.advanceTimersByTimeAsync(100);
    expect(provider).toHaveBeenCalledTimes(1);
  });
});
