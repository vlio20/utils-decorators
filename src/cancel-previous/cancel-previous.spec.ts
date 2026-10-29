import { cancelPrevious } from './cancel-previous';
import { CanceledPromise } from './canceled-promise';

describe('cancelPrevious', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidCancelPrevious: any = cancelPrevious<T>();

      class T {
        @nonValidCancelPrevious
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@cancelPrevious is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should cancel prev invocation', async () => {
    class T {
      @cancelPrevious<T>()
      foo(x: number): Promise<number> {
        return new Promise<number>((resolve) => {
          setTimeout(() => {
            resolve(x);
          }, 10);
        });
      }
    }

    const t = new T();
    const first = t.foo(10);
    const canceled = expect(first).rejects.toBeInstanceOf(CanceledPromise);
    const canceledMessage = expect(first).rejects.toThrow('canceled');
    await jest.advanceTimersByTimeAsync(5);
    const second = t.foo(100);
    await canceled;
    await canceledMessage;
    await jest.advanceTimersByTimeAsync(10);
    await expect(second).resolves.toBe(100);
  });

  it('should invoke original method id was resolved before second call', async () => {
    class T {
      @cancelPrevious()
      foo(x: number): Promise<number> {
        return new Promise<number>((resolve) => {
          setTimeout(() => {
            resolve(x);
          }, 10);
        });
      }
    }

    const t = new T();
    const first = t.foo(10);
    await jest.advanceTimersByTimeAsync(15);
    await expect(first).resolves.toBe(10);

    const second = t.foo(100);
    await jest.advanceTimersByTimeAsync(10);
    await expect(second).resolves.toBe(100);
  });

  it('should invoke rejection if original method got an error', async () => {
    class T {
      @cancelPrevious<T>()
      foo(x: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('server error'));
          }, 10);
        });
      }
    }

    const t = new T();
    const rejected = expect(t.foo(10)).rejects.toThrow('server error');
    await jest.advanceTimersByTimeAsync(10);
    await rejected;
  });
});
