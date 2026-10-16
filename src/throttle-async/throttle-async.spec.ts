import { sleep } from '../common/test-utils';
import { throttleAsync } from './throttle-async';

describe('throttle-async', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Discard remaining expiry, timeout, or scheduled work without executing it.
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonThrottleAsync: any = throttleAsync(50);

      class T {
        @nonThrottleAsync
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@throttleAsync is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify method invocation is throttled 1', async () => {
    class T {
      prop = 0;

      @throttleAsync()
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(30);

        return x;
      }
    }

    const t = new T();
    expect(t.prop).toEqual(0);
    const first = t.foo('a');
    expect(t.prop).toEqual(1);
    const second = t.foo('b');
    expect(t.prop).toEqual(1);
    await jest.advanceTimersByTimeAsync(29);
    expect(t.prop).toEqual(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(await first).toEqual('a');
    expect(t.prop).toEqual(2);
    await jest.advanceTimersByTimeAsync(30);
    expect(await second).toEqual('b');
  });

  it('should verify method invocation is throttled 2', async () => {
    class T {
      prop = 0;

      @throttleAsync(2)
      async foo(): Promise<number> {
        this.prop += 1;
        await sleep(20);

        return this.prop;
      }
    }

    const t = new T();
    const first = t.foo();
    const second = t.foo();
    expect(t.prop).toEqual(2);
    await jest.advanceTimersByTimeAsync(20);
    expect(await first).toEqual(2);
    expect(await second).toEqual(2);
    expect(t.prop).toEqual(2);
  });

  it('should work also with exceptions', async () => {
    class T {
      prop = 0;

      @throttleAsync()
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(30);

        if (this.prop === 1) {
          throw new Error('blarg');
        }

        return x;
      }
    }

    const t = new T();
    const rejected = expect(t.foo('a')).rejects.toThrow('blarg');
    const second = t.foo('b');
    await jest.advanceTimersByTimeAsync(30);
    await rejected;
    expect(t.prop).toEqual(2);
    await jest.advanceTimersByTimeAsync(30);
    expect(await second).toEqual('b');
  });

  it('should validate methods invoked in time', async () => {
    class T {
      prop = 0;

      @throttleAsync(2)
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(20);

        return x;
      }
    }

    const t = new T();

    t.foo('a');
    expect(t.prop).toEqual(1);
    t.foo('b');
    expect(t.prop).toEqual(2);

    await jest.advanceTimersByTimeAsync(30);
    t.foo('c');
    expect(t.prop).toEqual(3);

    const pending = t.foo('d');
    await jest.advanceTimersByTimeAsync(20);
    const val = await pending;
    expect(t.prop).toEqual(4);
    expect(val).toEqual('d');
  });

  it('should validate methods invoked between times', async () => {
    class T {
      prop = 0;

      @throttleAsync(2)
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(100);

        return x;
      }
    }

    const start = new Date();
    const t = new T();
    t.foo('a');
    t.foo('b');
    t.foo('c');
    t.foo('d');
    t.foo('e');
    t.foo('f');
    t.foo('g');
    t.foo('h');
    t.foo('j');

    const pending = t.foo('k');
    await jest.advanceTimersByTimeAsync(499);
    expect(t.prop).toEqual(10);
    const settled = jest.fn();
    pending.then(settled);
    await jest.advanceTimersByTimeAsync(0);
    expect(settled).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    expect(await pending).toEqual('k');
    const seconds = (new Date().getTime() - start.getTime()) / 1000;
    expect(seconds).toBeGreaterThanOrEqual(0.5);
    expect(seconds).toBeLessThan(0.6);
  });
});
