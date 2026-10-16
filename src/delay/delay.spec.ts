import { delay } from './delay';

describe('delay', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Discard remaining expiry, timeout, or scheduled work without executing it.
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidDelay: any = delay(50);

      class T {
        @nonValidDelay
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@delay is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify method invocation is delayed', async () => {
    class T {
      prop!: number;

      @delay<T>(50)
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(this.prop).toBe(3);
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    t.foo(1);

    await jest.advanceTimersByTimeAsync(49);
    expect(spy).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(1);

    t.foo(2);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(1);

    await jest.advanceTimersByTimeAsync(49);
    expect(spy).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(1);

    expect(spy).toHaveBeenCalledTimes(2);
  });
});
