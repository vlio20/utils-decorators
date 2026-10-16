import { timeout } from './timeout';
import { sleep } from '../common/utils/utils';
import { TimeoutError } from './timeout.index';

describe('timeout', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Discard remaining expiry, timeout, or scheduled work without executing it.
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidTimeout: any = timeout(50);

      class T {
        @nonValidTimeout
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@timeout is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should throw timeout exception after provided ms', async () => {
    const ms = 50;

    class T {
      @timeout(ms)
      async foo(): Promise<void> {
        await sleep(100);
      }
    }

    const t = new T();

    const pending = t.foo();
    const rejected = expect(pending).rejects.toBeInstanceOf(TimeoutError);
    const message = expect(pending).rejects.toThrow(`timeout occurred after ${ms}`);
    const settled = jest.fn();
    pending.then(settled, settled);
    await jest.advanceTimersByTimeAsync(49);
    expect(settled).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);
    await rejected;
    await message;
  });

  it('should no throw timeout exception after provided ms', async () => {
    const ms = 100;

    class T {
      @timeout(ms)
      async foo(): Promise<number> {
        await sleep(50);

        return Promise.resolve(1);
      }
    }

    const t = new T();
    const pending = t.foo();
    await jest.advanceTimersByTimeAsync(50);
    expect(await pending).toEqual(1);
  });

  it('should catch original exception after the method throw an error within provided ms', async () => {
    const ms = 50;

    class T {
      @timeout(ms)
      async foo() {
        await Promise.reject(1);
        await sleep(100);
      }
    }

    const t = new T();

    try {
      await t.foo();
    } catch (e) {
      expect(e).toEqual(1);
    }
  });

  it('should catch timeout exception if the method throw an error after provided ms', async () => {
    const ms = 50;

    class T {
      @timeout(ms)
      async foo() {
        await sleep(100);
        await Promise.reject(1);
      }
    }

    const t = new T();

    const rejected = expect(t.foo()).rejects.toBeInstanceOf(TimeoutError);
    await jest.advanceTimersByTimeAsync(50);
    await rejected;
    // Allow the original operation to reject after the timeout as well.
    await jest.advanceTimersByTimeAsync(50);
  });
});
