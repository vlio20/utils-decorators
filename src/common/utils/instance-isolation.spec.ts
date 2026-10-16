import { cancelPrevious } from '../../cancel-previous/cancel-previous';
import { CanceledPromise } from '../../cancel-previous/canceled-promise';
import { delegate } from '../../delegate/delegate';
import { memoize } from '../../memoize/memoize';
import { memoizeAsync } from '../../memoize-async/memoize-async';
import { rateLimit } from '../../rate-limit/rate-limit';
import { throttle } from '../../throttle/throttle';
import { throttleAsync } from '../../throttle-async/throttle-async';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(finish => { resolve = finish; });
  return { promise, resolve };
}

describe('decorator instance isolation', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('cancelPrevious cancels only the previous call on the same instance', async () => {
    class Service {
      @cancelPrevious()
      foo(promise: Promise<string>): Promise<string> {
        return promise;
      }
    }
    const first = new Service();
    const second = new Service();
    const old = deferred<string>();
    const other = deferred<string>();
    const latest = deferred<string>();
    const canceled = first.foo(old.promise).catch(error => error);
    const independent = second.foo(other.promise);
    const current = first.foo(latest.promise);

    other.resolve('other');
    latest.resolve('latest');
    old.resolve('old');
    await expect(canceled).resolves.toBeInstanceOf(CanceledPromise);
    await expect(independent).resolves.toBe('other');
    await expect(current).resolves.toBe('latest');
  });

  it('delegate shares pending work only within the same instance', async () => {
    class Service {
      calls = 0;
      pending = deferred<string>();

      @delegate()
      foo(): Promise<string> {
        this.calls += 1;
        return this.pending.promise;
      }
    }
    const first = new Service();
    const second = new Service();
    const firstCall = first.foo();
    expect(first.foo()).toBe(firstCall);
    const secondCall = second.foo();
    expect(secondCall).not.toBe(firstCall);
    expect(first.calls).toBe(1);
    expect(second.calls).toBe(1);
    first.pending.resolve('first');
    second.pending.resolve('second');
    await expect(firstCall).resolves.toBe('first');
    await expect(secondCall).resolves.toBe('second');
  });

  it('memoize keeps default caches separate with identical arguments', () => {
    class Service {
      calls = 0;
      constructor(readonly name: string) {}

      @memoize()
      foo(id: number): string {
        this.calls += 1;
        return `${this.name}:${id}`;
      }
    }
    const first = new Service('first');
    const second = new Service('second');
    expect(first.foo(1)).toBe('first:1');
    expect(second.foo(1)).toBe('second:1');
    expect(first.foo(1)).toBe('first:1');
    expect(second.foo(1)).toBe('second:1');
    expect(first.calls).toBe(1);
    expect(second.calls).toBe(1);
  });

  it('memoizeAsync isolates pending work and resolved caches', async () => {
    class Service {
      calls = 0;
      pending = deferred<string>();

      @memoizeAsync()
      foo(): Promise<string> {
        this.calls += 1;
        return this.pending.promise;
      }
    }
    const first = new Service();
    const second = new Service();
    const results = Promise.all([first.foo(), first.foo(), second.foo()]);
    first.pending.resolve('first');
    second.pending.resolve('second');
    await expect(results).resolves.toEqual(['first', 'first', 'second']);
    await expect(first.foo()).resolves.toBe('first');
    await expect(second.foo()).resolves.toBe('second');
    expect(first.calls).toBe(1);
    expect(second.calls).toBe(1);
  });

  it('rateLimit gives each instance an independent default budget', async () => {
    class Service {
      calls = 0;

      @rateLimit({ allowedCalls: 1, timeSpanMs: 50 })
      foo(): number {
        return ++this.calls;
      }
    }
    const first = new Service();
    const second = new Service();
    expect(first.foo()).toBe(1);
    expect(second.foo()).toBe(1);
    expect(() => first.foo()).toThrow();
    expect(() => second.foo()).toThrow();
    await jest.advanceTimersByTimeAsync(50);
    expect(first.foo()).toBe(2);
    expect(second.foo()).toBe(2);
  });

  it('throttle keeps cooldowns independent across instances', async () => {
    class Service {
      calls = 0;

      @throttle(50)
      foo(): void {
        this.calls += 1;
      }
    }
    const first = new Service();
    const second = new Service();
    first.foo();
    first.foo();
    await jest.advanceTimersByTimeAsync(25);
    second.foo();
    expect(first.calls).toBe(1);
    expect(second.calls).toBe(1);
    await jest.advanceTimersByTimeAsync(25);
    first.foo();
    second.foo();
    expect(first.calls).toBe(2);
    expect(second.calls).toBe(1);
  });

  it('throttleAsync gives each instance its own queue and concurrency slots', async () => {
    class Service {
      calls = 0;

      @throttleAsync(1)
      foo(promise: Promise<string>): Promise<string> {
        this.calls += 1;
        return promise;
      }
    }
    const first = new Service();
    const second = new Service();
    const active = deferred<string>();
    const queued = deferred<string>();
    const other = deferred<string>();
    const firstCall = first.foo(active.promise);
    const queuedCall = first.foo(queued.promise);
    const otherCall = second.foo(other.promise);
    expect(first.calls).toBe(1);
    expect(second.calls).toBe(1);

    other.resolve('other');
    await expect(otherCall).resolves.toBe('other');
    expect(first.calls).toBe(1);
    active.resolve('active');
    await expect(firstCall).resolves.toBe('active');
    await jest.advanceTimersByTimeAsync(0);
    expect(first.calls).toBe(2);
    queued.resolve('queued');
    await expect(queuedCall).resolves.toBe('queued');
  });
});
