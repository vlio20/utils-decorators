import { memoizeAsync } from './memoize-async';
import { AsyncCache } from './memoize-async.model';
import { sleep } from '../common/test-utils';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

describe('memoize-async', () => {
  it('should verify memoize async caching original method', async () => {
    const spy = mock.fn((x: number, y: number) => Promise.resolve(x + y));

    class T {
      prop: number;

      @memoizeAsync<T, number>(10)
      foo(x: number, y: number): Promise<number> {
        return this.goo(x, y);
      }

      goo(x: number, y: number): Promise<number> {
        assert.equal(this.prop, 3);
        return spy(x, y);
      }
    }

    const t = new T();
    t.prop = 3;

    const resp1 = await t.foo(1, 2);
    const resp2 = await t.foo(1, 2);
    const resp4 = await t.foo(1, 3);

    assert.equal(spy.mock.callCount(), 2);
    assert.deepEqual(spy.mock.calls[0].arguments, [1, 2]);
    assert.deepEqual(spy.mock.calls[1].arguments, [1, 3]);

    await sleep(20);
    const resp3 = await t.foo(1, 2);

    assert.equal(spy.mock.callCount(), 3);
    assert.equal(resp1, 3);
    assert.equal(resp2, 3);
    assert.equal(resp3, 3);
    assert.equal(resp4, 4);
  });

  it('should verify memoize key foo', async () => {
    const mapper = mock.fn((x: string, y: string) => `${x}_${y}`);
    const spyFooWithMapper = mock.fn((x: string, y: string) => Promise.resolve(x + y));

    class T {
      // eslint-disable-next-line class-methods-use-this
      @memoizeAsync<T, string>({ expirationTimeMs: 10, keyResolver: mapper })
      fooWithMapper(x: string, y: string): Promise<string> {
        return spyFooWithMapper(x, y);
      }
    }

    const t = new T();


    await t.fooWithMapper('x', 'y');
    await t.fooWithMapper('x', 'y');

    assert.equal(mapper.mock.callCount(), 2);
    assert.equal(spyFooWithMapper.mock.callCount(), 1);
    assert.deepEqual(spyFooWithMapper.mock.calls[0].arguments, ['x', 'y']);
  });

  it('should verify memoize key foo as string - target method', async () => {
    const spyFooWithMapper = mock.fn((x: string, y: string) => Promise.resolve(x + y));
    const spyMapper = mock.fn((x: string, y: string) => `${x}_${y}`);

    class T {
      foo = spyMapper;

      // eslint-disable-next-line class-methods-use-this
      @memoizeAsync<T, string>({ expirationTimeMs: 10, keyResolver: 'foo' })
      fooWithMapper(x: string, y: string): Promise<string> {
        return spyFooWithMapper(x, y);
      }
    }

    const prom = new Promise((resolve) => {
      const t = new T();

      t.fooWithMapper('x', 'y');
      t.fooWithMapper('x', 'y');

      setTimeout(() => {
        assert.equal(spyMapper.mock.callCount(), 2);
        assert.equal(spyFooWithMapper.mock.callCount(), 1);

        assert(spyMapper.mock.calls[0].arguments[0] === 'x');
        assert(spyMapper.mock.calls[0].arguments[1] === 'y');

        assert(spyFooWithMapper.mock.calls[0].arguments[0] === 'x');
        assert(spyFooWithMapper.mock.calls[0].arguments[1] === 'y');

        resolve(null);
      }, 0);
    });

    await prom;
  });

  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidMemoizeAsync: any = memoizeAsync<T, string>(50);

      class T {
        @nonValidMemoizeAsync boo: string;
      }
    }, Error('@memoizeAsync is applicable only on a methods.'));
  });

  it('should make sure that when promise is rejected it is removed from the cache', async () => {
    const err = new Error('rejected');
    const spy = mock.fn(() => Promise.reject(err));

    class T {
      @memoizeAsync<T, string>(20)
      async foo(): Promise<string> {
        return spy();
      }
    }

    const t = new T();
    await assert.rejects(async () => {
      await t.foo();
    }, err);

    await sleep(20);

    await assert.rejects(async () => {
      await t.foo();
    }, err);

    assert.equal(spy.mock.callCount(), 2);
  });

  it('should use provided cache', (_, done) => {
    const cache = new Map<string, number>();
    const spy = mock.fn();

    class T {
      @memoizeAsync<T, number>({ expirationTimeMs: 30, cache })
      foo(): Promise<number> {
        return spy();
      }

      goo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();
    t.foo();

    setTimeout(() => {
      t.foo();
      setTimeout(() => {
        assert.equal(spy.mock.callCount(), 1);

        cache.delete('[]');
        t.foo();

        setTimeout(() => {
          assert.equal(spy.mock.callCount(), 2);
          done();
        }, 0);
      }, 0);
    }, 10);
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

    assert.equal(await one, 1);
    assert.equal(await two, 2);
  });

  it('should verify that by default the cache is never cleaned', async () => {
    const cache = new Map();

    class T {
      @memoizeAsync<T, number>({ cache })
      foo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();

    await t.foo();
    assert.equal(cache.size, 1);

    await sleep(50);
    assert.equal(cache.size, 1);
  });

  it('should verify usage of async cache', async () => {
    const map = new Map<string, number>();
    const spy = mock.fn(() => Promise.resolve(1));

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
      @memoizeAsync<T, number>({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return spy();
      }
    }

    const prom = new Promise((resolve) => {
      const t = new T();
      t.foo();

      setTimeout(() => {
        t.foo();
        setTimeout(() => {
          assert.equal(spy.mock.callCount(), 1);

          cache.delete('[]');
          t.foo();

          setTimeout(() => {
            assert.equal(spy.mock.callCount(), 2);
            resolve(null);
          }, 0);
        }, 0);
      }, 10);
    });

    await prom;
  });

  it('should throw exception when async has method throws an exception', async () => {
    const map = new Map<string, number>();

    const cache: AsyncCache<number> = {
      delete: async (p1: string) => {
        map.delete(p1);
      },
      get: async (p1: string) => map.get(p1),
      has: async (_: string) => Promise.reject(new Error('error')),
      set: async (p1: string, p2: number) => {
        map.set(p1, p2);
      },
    };

    class T {
      @memoizeAsync<T, number>({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();
    await assert.rejects(async () => {
      await t.foo();
    }, Error('error'));
  });

  it('should throw exception when async get method throwing an exception', async () => {
    const map = new Map<string, number>();

    const cache: AsyncCache<number> = {
      delete: async (p1: string) => {
        map.delete(p1);
      },
      get: async (_: string) => Promise.reject(new Error('error')),
      has: async (_: string) => true,
      set: async (p1: string, p2: number) => {
        map.set(p1, p2);
      },
    };

    class T {
      @memoizeAsync<T, number>({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();
    await assert.rejects(async () => {
      await t.foo();
    }, Error('error'));
  });

  it('should throw exception when async set method throws an exception', async () => {
    const map = new Map<string, number>();

    const cache: AsyncCache<number> = {
      delete: async (p1: string) => {
        map.delete(p1);
      },
      get: async (p1: string) => map.get(p1),
      has: async (p1: string) => map.has(p1),
      set: async (_: string, __: number) => new Promise((___, reject) => {
        setTimeout(() => {
          reject(new Error('error'));
        });
      }),
    };

    class T {
      @memoizeAsync<T, number>({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const t = new T();
    await assert.rejects(async () => {
      await t.foo();
    }, Error('error'));
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
      @memoizeAsync<T, number>({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Promise<number> {
        return Promise.reject(new Error('error'));
      }
    }

    const t = new T();
    await assert.rejects(async () => {
      await t.foo();
    }, Error('error'));
  });
});
