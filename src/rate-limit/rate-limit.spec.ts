import { rateLimit } from './rate-limit';
import { sleep } from '../common/test-utils';
import { RateLimitAsyncCounter } from './rate-limit.model';
import { SimpleRateLimitCounter } from './simple-rate-limit-counter';
import { describe, it } from 'node:test';
import assert from 'node:assert';

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
    assert.throws(() => {
      const nonValidRateLimit: any = rateLimit({
        allowedCalls: 1,
        timeSpanMs: 1000,
      });

      class TT {
        @nonValidRateLimit boo: string;
      }
    }, Error('@rateLimit is applicable only on a method.'));
  });

  it('should make sure error on async and sync counters', () => {
    assert.throws(() => {
      class TT {
        @rateLimit({
          allowedCalls: 1,
          timeSpanMs: 1000,
          rateLimitAsyncCounter: {} as any,
          rateLimitCounter: {} as any,
        })
        foo() {}
      }
    }, Error('You can\'t provide both rateLimitAsyncCounter and rateLimitCounter.'));
  });

  it('should verify sync limit is working as expected', async () => {
    const t = new T();
    t.foo();
    await sleep(50);
    assert.equal(t.counter, 1);
    t.foo();
    await sleep(50);
    assert.equal(t.counter, 2);

    await sleep(50);

    assert.throws(() => {
      t.foo();
    }, Error('You have acceded the amount of allowed calls'));

    await sleep(80);
    const resp = t.foo();

    assert.equal(t.counter, 3);
    assert.equal(resp, 3);
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
    assert.equal(countMap.size, 1);
    await sleep(50);
    assert.equal(t.counter, 1);
    t.foo();
    assert.equal(countMap.size, 1);
    assert.equal(countMap.get('__rateLimit__'), 2);
    await sleep(50);
    assert.equal(t.counter, 2);

    await sleep(50);

    assert.throws(() => {
      t.foo();
    }, Error('You have acceded the amount of allowed calls'));

    await sleep(80);
    assert.equal(countMap.get('__rateLimit__'), 1);
    t.foo();
    assert.equal(countMap.get('__rateLimit__'), 2);

    assert.equal(t.counter, 3);

    await sleep(220);
    assert.equal(countMap.size, 0);
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
    assert.equal(t1.counter, 1);
    await t2.foo();
    await sleep(50);
    assert.equal(t1.counter, 1);
    assert.equal(t2.counter, 1);

    await sleep(50);

    await assert.rejects(async () => {
      await t1.foo();
    }, Error('You have acceded the amount of allowed calls'));

    await sleep(80);
    const resp1 = await t1.foo();
    const resp2 = await t2.foo();

    assert.equal(t1.counter, 2);
    assert.equal(resp1, 2);
    assert.equal(resp2, 2);

    assert.equal(counter.counterMap.has('__rateLimit__'), true);
  });

  it('should invoke provider mapper provided as function', async () => {
    class TT {
      @rateLimit({
        allowedCalls: 1,
        timeSpanMs: 200,
        keyResolver: (x: string) => x,
      })
      foo(_: string) {
      }
    }

    const t = new TT();
    t.foo('a');
    await sleep(50);
    t.foo('b');
    await sleep(50);

    assert.throws(() => {
      t.foo('a');
    }, Error('You have acceded the amount of allowed calls'));

    await sleep(120);

    assert.doesNotThrow(() => {
      t.foo('a');
    });
  });

  it('should invoke provider mapper provided as string', async () => {
    class TT {
      @rateLimit<TT>({
        allowedCalls: 1,
        timeSpanMs: 200,
        keyResolver: 'goo',
      })
      foo(_: string) {
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

    assert.throws(() => {
      t.foo('a');
    }, Error('You have acceded the amount of allowed calls'));

    await sleep(120);
    assert.doesNotThrow(() => {
      t.foo('a');
    });
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

    assert.throws(() => {
      t.foo();
    }, Error('blarg'));
  });
});
