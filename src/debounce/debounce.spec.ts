import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Discard remaining expiry, timeout, or scheduled work without executing it.
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidDebounce: any = debounce(50);

      class T {
        @nonValidDebounce
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@debounce is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify method invocation is debounced', async () => {
    class T {
      prop!: number;

      @debounce<T>(30)
      foo(): void {
        return this.goo();
      }

      goo(): void {
        expect(this.prop).toBe(3);
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    t.foo();

    expect(spy).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(10);
    expect(spy).toHaveBeenCalledTimes(0);
    t.foo();

    await jest.advanceTimersByTimeAsync(20);
    expect(spy).toHaveBeenCalledTimes(0);

    await jest.advanceTimersByTimeAsync(9);
    expect(spy).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should verify method params are passed', async () => {
    class T {
      @debounce<T>(5)
      foo(x: number, y: number): void {
        return this.goo(x, y);
      }

      goo(x: number, y: number): void {

      }
    }

    const t = new T();
    const spy = jest.spyOn(T.prototype, 'goo');
    t.foo(1, 2);

    await jest.advanceTimersByTimeAsync(4);
    expect(spy).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(spy).toHaveBeenCalledWith(1, 2);
  });

  it('should multi instances working', async () => {
    class T {

      @debounce<T>(30)
      foo(): void {
        return this.goo();
      }

      goo(): void {
      }
    }

    const t1 = new T();
    const t2 = new T();
    const spy1 = jest.spyOn(t1, 'goo');
    const spy2 = jest.spyOn(t2, 'goo');
    t1.foo();

    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(10);
    expect(spy1).not.toHaveBeenCalled();
    t2.foo();

    await jest.advanceTimersByTimeAsync(30); // 40
    expect(spy1).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(30); // 70
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
  });
});
