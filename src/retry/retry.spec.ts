import { retry } from './retry';
import { retryfy } from './retryfy';

describe('retry', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Discard remaining expiry, timeout, or scheduled work without executing it.
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidRetry: any = retry(50);

      class T {
        @nonValidRetry
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@retry is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should retry twice', async () => {
    class T {
      counter = 0;

      @retry({
        retries: 2,
        delay: 10,
      })
      foo(): Promise<string> {
        if (this.counter === 0) {
          this.counter += 1;

          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    const pending = t.foo();
    await jest.advanceTimersByTimeAsync(10);
    const res = await pending;
    expect(t.counter).toEqual(1);
    expect(res).toEqual('yes');
  });

  it('should throw exception after retries', async () => {
    class T {
      counter = 0;

      @retry({
        retries: 2,
        delay: 10,
      })
      foo(): Promise<string> {
        this.counter += 1;

        return Promise.reject(new Error('no'));
      }
    }

    const t = new T();
    const pending = t.foo();
    const rejected = expect(pending).rejects.toThrow('no');
    await jest.advanceTimersByTimeAsync(20);
    await rejected;
    expect(t.counter).toEqual(3);
  });

  it('should wait according to configured delay', async () => {
    class T {
      counter = 0;

      @retry({
        retries: 2,
        delay: 50,
      })
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter < 3) {
          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    const pending = t.foo();
    await jest.advanceTimersByTimeAsync(49);
    expect(t.counter).toEqual(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(t.counter).toEqual(2);
    await jest.advanceTimersByTimeAsync(49);
    expect(t.counter).toEqual(2);
    await jest.advanceTimersByTimeAsync(1);
    expect(t.counter).toEqual(3);
    await expect(pending).resolves.toBe('yes');
  });

  it('should wait according to retries array', async () => {
    class T {
      counter = 0;

      @retry([50, 100])
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter !== 3) {
          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    const pending = t.foo();
    await jest.advanceTimersByTimeAsync(49);
    expect(t.counter).toEqual(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(t.counter).toEqual(2);
    await jest.advanceTimersByTimeAsync(99);
    expect(t.counter).toEqual(2);
    await jest.advanceTimersByTimeAsync(1);
    expect(t.counter).toEqual(3);
    await expect(pending).resolves.toBe('yes');
  });

  it('should wait according to retries object with delaysArray', async () => {
    class T {
      counter = 0;

      @retry({
        delaysArray: [50, 100],
      })
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter !== 3) {
          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    const pending = t.foo();
    await jest.advanceTimersByTimeAsync(49);
    expect(t.counter).toEqual(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(t.counter).toEqual(2);
    await jest.advanceTimersByTimeAsync(99);
    expect(t.counter).toEqual(2);
    await jest.advanceTimersByTimeAsync(1);
    expect(t.counter).toEqual(3);
    await expect(pending).resolves.toBe('yes');
  });

  it('should wait 1 sec by default', async () => {
    class T {
      counter = 0;

      @retry(1)
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter === 1) {
          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    const prom = t.foo();
    await jest.advanceTimersByTimeAsync(999);
    expect(t.counter).toEqual(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(t.counter).toEqual(2);

    expect(await prom).toEqual('yes');
    expect(t.counter).toEqual(2);
  });

  it('should throw error when invalid input', async () => {
    expect(() => {
      // @ts-expect-error A string is not a valid retry configuration.
      retryfy(async () => undefined, '6');
    }).toThrow('invalid input');
  });

  it('should invoke onRetry', async () => {
    const onRetry = jest.fn();

    class T {
      counter = 0;

      decCounter = 0;

      @retry({
        retries: 3,
        delay: 10,
        onRetry,
      })
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter < 3) {
          return Promise.reject(new Error(`no ${this.counter}`));
        }

        return Promise.resolve('yes');
      }

      @retry({
        retries: 3,
        delay: 10,
        onRetry: 'retry',
      })
      goo(): Promise<void> {
        if (this.decCounter < 3) {
          return Promise.reject(new Error(`no ${this.decCounter}`));
        }

        return Promise.resolve();
      }

      retry(e: unknown, c: number): void {
        this.decCounter += 1;
      }
    }

    const t = new T();
    const foo = t.foo();
    await jest.advanceTimersByTimeAsync(20);
    await foo;
    const goo = t.goo();
    await jest.advanceTimersByTimeAsync(30);
    await goo;

    expect(onRetry).toHaveBeenCalledTimes(2);
    const argsFirstCall = onRetry.mock.calls[0];
    expect(argsFirstCall[0].message).toEqual('no 1');
    expect(argsFirstCall[1]).toEqual(0);

    const argsSecondCall = onRetry.mock.calls[1];
    expect(argsSecondCall[0].message).toEqual('no 2');
    expect(argsSecondCall[1]).toEqual(1);

    expect(t.decCounter).toEqual(3);
  });

  it('should throw error when provided both retires and delaysArray', () => {
    try {
      class T {
        // @ts-expect-error Deliberately invalid configuration to verify runtime validation.
        @retry({
          retries: 3,
          delaysArray: [1, 2, 3],
        })
        boo(): Promise<void> {
          return Promise.resolve();
        }
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('You can not provide both retries and delaysArray').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should fill the delays with 1000ms by default', async () => {
    class T {
      counter = 0;

      decCounter = 0;

      @retry({
        retries: 1,
      })
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter < 2) {
          return Promise.reject(new Error(`no ${this.counter}`));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();

    const pending = t.foo();
    await jest.advanceTimersByTimeAsync(999);
    expect(t.counter).toEqual(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(t.counter).toEqual(2);
    await expect(pending).resolves.toBe('yes');
  });
});

describe('original arguments in retry hooks', () => {
  it('forwards original arguments to retry callbacks on every retry', async () => {
    const failure = new Error('retry');
    const payload = { id: 172 };
    const hook = jest.fn();
    const source = jest.fn(async (...args: unknown[]) => {
      if (source.mock.calls.length < 3) { throw failure; }

      return args;
    });
    const wrapped = retryfy(source, { retries: 2, delay: 0, onRetry: hook });
    await expect(wrapped(payload, 'name')).resolves.toEqual([payload, 'name']);
    expect(hook).toHaveBeenNthCalledWith(1, failure, 0, [payload, 'name']);
    expect(hook).toHaveBeenNthCalledWith(2, failure, 1, [payload, 'name']);
    expect(hook.mock.calls[0][2][0]).toBe(payload);
  });

  it('forwards arguments to named retry hooks with the instance receiver', async () => {
    const failure = new Error('retry');
    class Service {
      attempts = 0;
      received: unknown;
      onRetry(error: unknown, index: number, ...rest: unknown[]): void {
        this.received = [error, index, ...rest];
      }

      @retry({ retries: 1, delay: 0, onRetry: 'onRetry' })
      async load(id: number): Promise<number> {
        this.attempts += 1;

        if (this.attempts === 1) { throw failure; }

        return id;
      }
    }
    const service = new Service();
    await expect(service.load(172)).resolves.toBe(172);
    expect(service.received).toEqual([failure, 0, [172]]);
  });
});
