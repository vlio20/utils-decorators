import { rateLimit } from './rate-limit';
import { sleep } from '../common/test-utils';
import { RateLimitAsyncCounter } from './rate-limit.model';
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
    this.counterMap.set(key, this.counterMap.get(key) + 1);
  }

  async dec(key: string): Promise<void> {
    await sleep(10);
    const currentCount = this.counterMap.get(key);

    await sleep(10);
    if (currentCount === 1) {
      this.counterMap.delete(key);
    } else {
      this.counterMap.set(key, currentCount - 1);
    }
  }
}

describe('rate-limit', () => {
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
        boo: string;
      }
    } catch (e) {
      expect('@rateLimit is applicable only on a method.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should make sure error on async and sync counters', () => {
    try {
      class TT {
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
      expect('You cant provide both rateLimitAsyncCounter and rateLimitCounter.').toBe(e.message);
    }
  });

  it('should verify sync limit is working as expected', async () => {
    const t = new T();
    t.foo();
    await sleep(50);
    expect(t.counter).toEqual(1);
    t.foo();
    await sleep(50);
    expect(t.counter).toEqual(2);

    await sleep(50);

    try {
      t.foo();
      throw new Error('should not get to this line');
    } catch (e) {
      expect(e.message).toEqual('You have acceded the amount of allowed calls');
    }

    await sleep(80);
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
    await sleep(50);
    expect(t.counter).toEqual(1);
    t.foo();
    expect(countMap.size).toEqual(1);
    expect(countMap.get('__rateLimit__')).toEqual(2);
    await sleep(50);
    expect(t.counter).toEqual(2);

    await sleep(50);

    try {
      t.foo();
      throw new Error('should not get to this line');
    } catch (e) {
      expect(e.message).toEqual('You have acceded the amount of allowed calls');
    }

    await sleep(80);
    expect(countMap.get('__rateLimit__')).toEqual(1);
    t.foo();
    expect(countMap.get('__rateLimit__')).toEqual(2);

    expect(t.counter).toEqual(3);

    await sleep(220);
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

    await t1.foo();
    await sleep(50);
    expect(t1.counter).toEqual(1);
    await t2.foo();
    await sleep(50);
    expect(t1.counter).toEqual(1);
    expect(t2.counter).toEqual(1);

    await sleep(50);

    try {
      await t1.foo();
      throw new Error('should not get to this line');
    } catch (e) {
      expect(e.message).toEqual('You have acceded the amount of allowed calls');
    }

    await sleep(80);
    const resp1 = await t1.foo();
    const resp2 = await t2.foo();

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
    await sleep(50);
    t.foo('b');
    await sleep(50);

    try {
      t.foo('a');
      throw new Error('should not get to this line');
    } catch (e) {
      expect(e.message).toEqual('You have acceded the amount of allowed calls');
    }

    await sleep(120);
    t.foo('a');
  });

  it('should invoke provider mapper provided as string', async () => {
    class TT {
      @rateLimit<TT>({
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
    await sleep(50);
    t.foo('b');
    await sleep(50);

    try {
      t.foo('a');
      throw new Error('should not get to this line');
    } catch (e) {
      expect(e.message).toEqual('You have acceded the amount of allowed calls');
    }

    await sleep(120);
    t.foo('a');
  });

  it('should invoke custom handler when exceeds the amount of allowed calls', async () => {
    class TT {
      @rateLimit<TT>({
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
    await sleep(20);

    try {
      t.foo();
      throw new Error('should not get to this line');
    } catch (e) {
      expect(e.message).toEqual('blarg');
    }
  });
});
