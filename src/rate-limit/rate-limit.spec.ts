import { rateLimitify } from './rate-limitify';
import { rateLimit } from './rate-limit';
import { sleep } from '../common/test-utils';
import { RateLimitAsyncCounter, RateLimitCounter } from './rate-limit.model';
import { SimpleRateLimitCounter } from './simple-rate-limit-counter';

export class AsyncSimpleRateLimitCounter implements RateLimitAsyncCounter {
  counterMap = new Map<string, number>();

  async getCount(key: string): Promise<number> {
    await sleep(10);

    return this.counterMap.get(key) ?? 0;
  }

  async inc(key: string): Promise<void> {
    await sleep(10);

    if (!this.counterMap.has(key)) {
      await sleep(10);
      this.counterMap.set(key, 0);
    }

    await sleep(10);
    this.counterMap.set(key, ((this.counterMap.get(key) ?? 0) + 1));
  }

  async dec(key: string): Promise<void> {
    await sleep(10);
    const currentCount = this.counterMap.get(key) ?? 0;

    await sleep(10);

    if (currentCount === 1) {
      this.counterMap.delete(key);
    } else {
      this.counterMap.set(key, currentCount - 1);
    }
  }
}

describe('rate-limit', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Discard remaining expiry, timeout, or scheduled work without executing it.
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  class T {
    counter = 0;

    @rateLimit({ allowedCalls: 2, timeSpanMs: 200 })
    foo() {
      this.counter += 1;

      return this.counter;
    }
  }

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidRateLimit: any = rateLimit({
        allowedCalls: 1,
        timeSpanMs: 1000,
      });

      class TT {
        @nonValidRateLimit
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@rateLimit is applicable only on a method.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should make sure error on async and sync counters', () => {
    try {
      class TT {
        // @ts-expect-error Deliberately invalid configuration to verify runtime validation.
        @rateLimit({
          allowedCalls: 1,
          timeSpanMs: 1000,
          rateLimitAsyncCounter: {} as any,
          rateLimitCounter: {} as any,
        })
        foo() {
        }
      }

      throw new Error('should not reach this line');
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('You cant provide both rateLimitAsyncCounter and rateLimitCounter.').toBe(e.message);
    }
  });

  it('should verify sync limit is working as expected', async () => {
    const t = new T();
    t.foo();
    await jest.advanceTimersByTimeAsync(50);
    expect(t.counter).toEqual(1);
    t.foo();
    await jest.advanceTimersByTimeAsync(50);
    expect(t.counter).toEqual(2);

    await jest.advanceTimersByTimeAsync(50);

    try {
      t.foo();

      throw new Error('should not get to this line');
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toEqual('You have acceded the amount of allowed calls');
    }

    await jest.advanceTimersByTimeAsync(80);
    const resp = t.foo();

    expect(t.counter).toEqual(3);
    expect(resp).toEqual(3);
  });

  it('should verify sync limit is working as expected with custom Rate Limiter', async () => {
    const countMap = new Map<string, number>();

    class TT {
      counter = 0;

      @rateLimit({
        allowedCalls: 2,
        timeSpanMs: 200,
        rateLimitCounter: new SimpleRateLimitCounter(countMap),
      })
      foo() {
        this.counter += 1;
      }
    }

    const t = new TT();
    t.foo();
    expect(countMap.size).toEqual(1);
    await jest.advanceTimersByTimeAsync(50);
    expect(t.counter).toEqual(1);
    t.foo();
    expect(countMap.size).toEqual(1);
    expect(countMap.get('__rateLimit__')).toEqual(2);
    await jest.advanceTimersByTimeAsync(50);
    expect(t.counter).toEqual(2);

    await jest.advanceTimersByTimeAsync(50);

    try {
      t.foo();

      throw new Error('should not get to this line');
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toEqual('You have acceded the amount of allowed calls');
    }

    await jest.advanceTimersByTimeAsync(80);
    expect(countMap.get('__rateLimit__')).toEqual(1);
    t.foo();
    expect(countMap.get('__rateLimit__')).toEqual(2);

    expect(t.counter).toEqual(3);

    await jest.advanceTimersByTimeAsync(220);
    expect(countMap.size).toEqual(0);
  });

  it('should verify async limit is working as expected with custom Rate Limiter', async () => {
    const counter = new AsyncSimpleRateLimitCounter();

    class TT {
      counter = 0;

      @rateLimit({
        allowedCalls: 2,
        timeSpanMs: 200,
        rateLimitAsyncCounter: counter,
      })
      async foo() {
        this.counter += 1;

        return this.counter;
      }
    }

    const t1 = new TT();
    const t2 = new TT();

    const first = t1.foo();
    await jest.advanceTimersByTimeAsync(40);
    await first;
    await jest.advanceTimersByTimeAsync(50);
    expect(t1.counter).toEqual(1);
    const second = t2.foo();
    await jest.advanceTimersByTimeAsync(30);
    await second;
    await jest.advanceTimersByTimeAsync(50);
    expect(t1.counter).toEqual(1);
    expect(t2.counter).toEqual(1);

    await jest.advanceTimersByTimeAsync(50);

    const rejected = expect(t1.foo()).rejects.toThrow('You have acceded the amount of allowed calls');
    await jest.advanceTimersByTimeAsync(10);
    await rejected;

    await jest.advanceTimersByTimeAsync(80);
    const next1 = t1.foo();
    await jest.advanceTimersByTimeAsync(30);
    const resp1 = await next1;
    const next2 = t2.foo();
    await jest.advanceTimersByTimeAsync(30);
    const resp2 = await next2;

    expect(t1.counter).toEqual(2);
    expect(resp1).toEqual(2);
    expect(resp2).toEqual(2);

    expect(counter.counterMap.has('__rateLimit__')).toEqual(true);
  });

  it('should invoke provider mapper provided as function', async () => {
    class TT {
      @rateLimit({
        allowedCalls: 1,
        timeSpanMs: 200,
        keyResolver: (x: string) => x,
      })
      foo(x: string) {
      }
    }

    const t = new TT();
    t.foo('a');
    await jest.advanceTimersByTimeAsync(50);
    t.foo('b');
    await jest.advanceTimersByTimeAsync(50);

    try {
      t.foo('a');

      throw new Error('should not get to this line');
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toEqual('You have acceded the amount of allowed calls');
    }

    await jest.advanceTimersByTimeAsync(120);
    t.foo('a');
  });

  it('should invoke provider mapper provided as string', async () => {
    class TT {
      @rateLimit({
        allowedCalls: 1,
        timeSpanMs: 200,
        keyResolver: 'goo',
      })
      foo(x: string) {
      }

      goo(x: string) {
        return x;
      }
    }

    const t = new TT();
    t.foo('a');
    await jest.advanceTimersByTimeAsync(50);
    t.foo('b');
    await jest.advanceTimersByTimeAsync(50);

    try {
      t.foo('a');

      throw new Error('should not get to this line');
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toEqual('You have acceded the amount of allowed calls');
    }

    await jest.advanceTimersByTimeAsync(120);
    t.foo('a');
  });

  it('should invoke custom handler when exceeds the amount of allowed calls', async () => {
    class TT {
      @rateLimit({
        allowedCalls: 1,
        timeSpanMs: 50,
        exceedHandler: () => {
          throw new Error('blarg');
        },
      })
      foo() {
      }
    }

    const t = new TT();
    t.foo();
    await jest.advanceTimersByTimeAsync(20);

    try {
      t.foo();

      throw new Error('should not get to this line');
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toEqual('blarg');
    }
  });
});

it('returns a promise with an async counter even for a synchronous source', async () => {
  const counter: RateLimitAsyncCounter = {
    inc: async () => {},
    dec: async () => {},
    getCount: async () => 0,
  };
  const receiver = {
    base: 10,
    wrapped: rateLimitify(function (this: { base: number }, id: number) {
      return this.base + id;
    }, { allowedCalls: 1, timeSpanMs: 0, rateLimitAsyncCounter: counter }),
  };
  const result = receiver.wrapped(2);
  expect(result).toBeInstanceOf(Promise);
  await expect(result).resolves.toBe(12);
});

describe('original arguments in rate-limit hooks', () => {
  it.each([false, true])('forwards rate-limit arguments with async counter: %s', async (asyncCounter) => {
    const counter: RateLimitCounter = { getCount: () => 1, inc: jest.fn(), dec: jest.fn() };
    const asyncRateCounter: RateLimitAsyncCounter = {
      getCount: async () => 1, inc: async () => {}, dec: async () => {},
    };
    const exceedHandler = jest.fn(() => { throw new Error('blocked'); });
    const config = {
      allowedCalls: 1, timeSpanMs: 1, exceedHandler,
      ...(asyncCounter ? { rateLimitAsyncCounter: asyncRateCounter } : { rateLimitCounter: counter }),
    };
    const source = jest.fn(async (id: number, name: string) => [id, name]);
    const wrapped = rateLimitify(source, config);
    await expect(Promise.resolve().then(() => wrapped(172, 'name'))).rejects.toThrow('blocked');
    expect(exceedHandler).toHaveBeenCalledWith(172, 'name');
    expect(source).not.toHaveBeenCalled();

    class Service {
      // eslint-disable-next-line class-methods-use-this
      @rateLimit(config)
      async load(id: number, name: string): Promise<unknown[]> { return [id, name]; }
    }
    await expect(Promise.resolve().then(() => new Service().load(173, 'other'))).rejects.toThrow('blocked');
    expect(exceedHandler).toHaveBeenLastCalledWith(173, 'other');
  });
});
