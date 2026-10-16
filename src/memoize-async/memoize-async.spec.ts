import { memoizeAsync } from './memoize-async';
import { AsyncCache } from './memoize-async.model';

describe('memozie-async', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Discard remaining expiry, timeout, or scheduled work without executing it.
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should verify memoize async caching original method', async () => {
    class T {
      prop!: number;

      @memoizeAsync<T, number>(10)
      foo(x: number, y: number): Promise<number> {
        return this.goo(x, y);
      }

      goo(x: number, y: number): Promise<number> {
        expect(this.prop).toBe(3);

        return Promise.resolve(x + y);
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    const resp1 = t.foo(1, 2);
    const resp2 = t.foo(1, 2);
    expect(await resp1).toBe(3);
    expect(await resp2).toBe(3);
    expect(spy).toHaveBeenCalledWith(1, 2);
    expect(spy).toHaveBeenCalledTimes(1);

    expect(await t.foo(1, 3)).toBe(4);
    expect(spy).toHaveBeenCalledWith(1, 3);
    expect(spy).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(9);
    expect(await t.foo(1, 2)).toBe(3);
    expect(spy).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(1);
    expect(await t.foo(1, 2)).toBe(3);
    expect(spy).toHaveBeenLastCalledWith(1, 2);
    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('should verify memoize key foo', async () => {
    const mapper = jest.fn((x: string, y: string) => `${x}_${y}`);

    class T {
      @memoizeAsync({ expirationTimeMs: 10, keyResolver: mapper })
      fooWithMapper(x: string, y: string): Promise<string> {
        return this.goo(x, y);
      }

      goo(x: string, y: string): Promise<string> {
        return Promise.resolve(x + y);
      }
    }

    const t = new T();
    const spyFooWithMapper = jest.spyOn(T.prototype, 'goo');

    await t.fooWithMapper('x', 'y');
    await t.fooWithMapper('x', 'y');

    expect(mapper.mock.calls.length).toBe(2);
    expect(spyFooWithMapper).toHaveBeenCalledTimes(1);
    expect(spyFooWithMapper).toHaveBeenCalledWith('x', 'y');
  });

  it('should verify memoize key foo as string - target method', async () => {
    class T {
      foo(x: string, y: string): string {
        return `${x}_${y}`;
      }

      @memoizeAsync({ expirationTimeMs: 10, keyResolver: 'foo' })
      fooWithMapper(x: string, y: string): Promise<string> {
        return this.goo(x, y);
      }

      goo(x: string, y: string): Promise<string> {
        return Promise.resolve(x + y);
      }
    }

    const t = new T();
    const spyFooWithMapper = jest.spyOn(T.prototype, 'goo');
    const mapper = jest.spyOn(T.prototype, 'foo');

    await t.fooWithMapper('x', 'y');
    await t.fooWithMapper('x', 'y');

    expect(mapper).toHaveBeenCalledTimes(2);
    expect(spyFooWithMapper).toHaveBeenCalledTimes(1);
    expect(spyFooWithMapper).toHaveBeenCalledWith('x', 'y');
    expect(mapper).toHaveBeenCalledWith('x', 'y');
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidMemoizeAsync: any = memoizeAsync<T, string>(50);

      class T {
        @nonValidMemoizeAsync
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@memoizeAsync is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should make sure that when promise is rejected it is removed from the cache', async () => {
    class T {
      @memoizeAsync<T, string>(20)
      foo(): Promise<string> {
        return this.goo();
      }

      goo(): Promise<string> {
        return Promise.reject(new Error('rejected'));
      }
    }

    const t = new T();
    const spy = jest.spyOn(T.prototype, 'goo');

    await expect(t.foo()).rejects.toThrow('rejected');
    // Retry before expiry to prove rejection evicts the cached promise.
    await expect(t.foo()).rejects.toThrow('rejected');
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should use provided cache', async () => {
    const cache = new Map<string, number>();

    class T {
      @memoizeAsync({ expirationTimeMs: 30, cache })
      foo(): Promise<number> {
        return this.goo();
      }

      goo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const spy = jest.spyOn(T.prototype, 'goo');

    const t = new T();
    await t.foo();
    await jest.advanceTimersByTimeAsync(10);
    await t.foo();
    expect(spy).toHaveBeenCalledTimes(1);
    cache.delete('[]');
    await t.foo();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should use different scope to different usages', async () => {
    class T {
      @memoizeAsync<T, number>(20)
      foo(): Promise<number> {
        return Promise.resolve(1);
      }

      @memoizeAsync<T, number>(20)
      goo(): Promise<number> {
        return Promise.resolve(2);
      }
    }

    const t = new T();
    const one = t.foo();
    const two = t.goo();

    expect(await one).toBe(1);
    expect(await two).toBe(2);
  });

  it('should verify that by default the cache is never cleaned', async () => {
    const cache = new Map();

    class T {
      @memoizeAsync({ cache })
      foo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();

    await t.foo();
    expect(cache.size).toEqual(1);

    await jest.advanceTimersByTimeAsync(50);
    expect(cache.size).toEqual(1);
  });

  it('should verify usage of async cache', async () => {
    const map = new Map<string, number>();

    const cache: AsyncCache<number> = {
      delete: async (p1: string) => {
        map.delete(p1);
      },
      get: async (p1: string) => map.get(p1),
      has: async (p1: string) => map.has(p1),
      set: async (p1: string, p2: number) => {
        map.set(p1, p2);
      },
    };

    class T {
      @memoizeAsync({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return this.goo();
      }

      goo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const spy = jest.spyOn(T.prototype, 'goo');
    const t = new T();
    await t.foo();
    await jest.advanceTimersByTimeAsync(10);
    await t.foo();
    expect(spy).toHaveBeenCalledTimes(1);
    await cache.delete('[]');
    await t.foo();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should throw exception when async has method throws an exception', async () => {
    const map = new Map<string, number>();

    const cache: AsyncCache<number> = {
      delete: async (p1: string) => {
        map.delete(p1);
      },
      get: async (p1: string) => map.get(p1),
      has: async (p1: string) => Promise.reject(new Error('error')),
      set: async (p1: string, p2: number) => {
        map.set(p1, p2);
      },
    };

    class T {
      @memoizeAsync({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();
    try {
      await t.foo();
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toBe('error');

      return;
    }

    throw new Error('shouldn\'t get to here');
  });

  it('should throw exception when async get method throws an exception', async () => {
    const map = new Map<string, number>();

    const cache: AsyncCache<number> = {
      delete: async (p1: string) => {
        map.delete(p1);
      },
      get: async (p1: string) => Promise.reject(new Error('error')),
      has: async (p1: string) => Promise.resolve(true),
      set: async (p1: string, p2: number) => {
        map.set(p1, p2);
      },
    };

    class T {
      @memoizeAsync({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();
    try {
      await t.foo();
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toBe('error');

      return;
    }

    throw new Error('shouldn\'t get to here');
  });

  it('should throw exception when async get method throws an exception', async () => {
    const map = new Map<string, number>();

    const cache: AsyncCache<number> = {
      delete: async (p1: string) => {
        map.delete(p1);
      },
      get: async (p1: string) => Promise.reject(new Error('error')),
      has: async (p1: string) => true,
      set: async (p1: string, p2: number) => {
        map.set(p1, p2);
      },
    };

    class T {
      @memoizeAsync({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();
    try {
      await t.foo();
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toBe('error');

      return;
    }

    throw new Error('shouldn\'t get to here');
  });

  it('should throw exception when async set method throws an exception', async () => {
    const map = new Map<string, number>();

    const cache: AsyncCache<number> = {
      delete: async (p1: string) => {
        map.delete(p1);
      },
      get: async (p1: string) => map.get(p1),
      has: async (p1: string) => map.has(p1),
      set: async (p1: string, p2: number) => new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('error'));
        });
      }),
    };

    class T {
      @memoizeAsync({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();
    const rejected = expect(t.foo()).rejects.toThrow('error');
    await jest.advanceTimersByTimeAsync(0);
    await rejected;
  });

  it('should throw exception when original method is broken', async () => {
    const map = new Map<string, number>();

    const cache: AsyncCache<number> = {
      delete: async (p1: string) => {
        map.delete(p1);
      },
      get: async (p1: string) => map.get(p1),
      has: async (p1: string) => map.has(p1),
      set: async (p1: string, p2: number) => {
        map.set(p1, p2);
      },
    };

    class T {
      @memoizeAsync({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return Promise.reject(new Error('error'));
      }
    }

    const t = new T();
    try {
      await t.foo();
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toBe('error');

      return;
    }

    throw new Error('shouldn\'t get to here');
  });
});
