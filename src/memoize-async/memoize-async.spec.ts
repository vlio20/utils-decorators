import {memoizeAsync} from './memoize-async';

describe('memozie-async', () => {
  it('should verify memoize async caching original method', async (done) => {
    class T {
      prop: number;

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

    setTimeout(() => {
      expect(spy).toHaveBeenCalledWith(1, 2);
      expect(spy).toBeCalledTimes(1);

      const resp_1 = t.foo(1, 3);

      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(1, 3);
        expect(spy).toBeCalledTimes(2);
      }, 0);

      setTimeout(async () => {
        const resp3 = t.foo(1, 2);

        setTimeout(async () => {
          expect(spy).toHaveBeenCalledWith(1, 2);

          expect(spy).toBeCalledTimes(3);

          expect(await resp1).toBe(3);
          expect(await resp2).toBe(3);
          expect(await resp3).toBe(3);
          expect(await resp_1).toBe(4);
          done();
        }, 0);
      }, 20);
    }, 0);
  });

  it('should verify memoize key mapper', async (done) => {
    const mapper = jest.fn((x: string, y: string) => {
      return `${x}_${y}`;
    });

    class T {
      @memoizeAsync<T, string>({expirationTimeMs: 10, keyResolver: mapper})
      fooWithMapper(x: string, y: string): Promise<string> {
        return this.goo(x, y);
      }

      goo(x: string, y: string): Promise<string> {
        return Promise.resolve(x + y);
      }
    }

    const t = new T();
    const spyFooWithMapper = jest.spyOn(T.prototype, 'goo');

    t.fooWithMapper('x', 'y');
    t.fooWithMapper('x', 'y');

    setTimeout(() => {
      expect(mapper.mock.calls.length).toBe(2);
      expect(spyFooWithMapper).toHaveBeenCalledTimes(1);
      expect(spyFooWithMapper).toHaveBeenCalledWith('x', 'y');
      done();
    }, 0);
  });

  it('should verify memoize key mapper as string - target method', async (done) => {
    class T {
      mapper(x: string, y: string): string {
        return `${x}_${y}`;
      }

      @memoizeAsync<T, string>({expirationTimeMs: 10, keyResolver: 'mapper'})
      fooWithMapper(x: string, y: string): Promise<string> {
        return this.goo(x, y);
      }

      goo(x: string, y: string): Promise<string> {
        return Promise.resolve(x + y);
      }
    }

    const t = new T();
    const spyFooWithMapper = jest.spyOn(T.prototype, 'goo');
    const mapper = jest.spyOn(T.prototype, 'mapper');

    t.fooWithMapper('x', 'y');
    t.fooWithMapper('x', 'y');

    setTimeout(() => {
      expect(mapper).toHaveBeenCalledTimes(2);
      expect(spyFooWithMapper).toHaveBeenCalledTimes(1);
      expect(spyFooWithMapper).toHaveBeenCalledWith('x', 'y');
      expect(mapper).toHaveBeenCalledWith('x', 'y');
      done();
    }, 0);
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidMemoizeAsync: any = memoizeAsync<T, string>(50);

      class T {
        @nonValidMemoizeAsync
        boo: string;
      }
    } catch (e) {
      expect('@memoizeAsync is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should make sure that when promise rejected it is removed from cache', (done) => {
    class T {
      @memoizeAsync<T, string>(20)
      foo(): Promise<string> {
        return this.goo();
      }

      goo(): Promise<string> {
        return Promise.reject('rejected');
      }
    }

    const t = new T();
    const spy = jest.spyOn(T.prototype, 'goo');

    t.foo()
      .catch((e) => {
        expect(e).toBe('rejected');
      });

    setTimeout(() => {
      t.foo().catch((e) => {
        expect(e).toBe('rejected');
      });

      setTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(2);
        done();
      }, 0);
    }, 20);
  });

  it('should use provided cache', (done) => {
    const cache = new Map<string, number>();

    class T {
      @memoizeAsync<T, number>({expirationTimeMs: 30, cache})
      foo(): Promise<number> {
        return this.goo();
      }

      goo(): Promise<number> {
        return Promise.resolve(1);
      }
    }

    const spy = jest.spyOn(T.prototype, 'goo');

    const t = new T();
    t.foo();

    setTimeout(() => {
      t.foo();
      setTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(1);

        cache.delete('[]');
        t.foo();

        setTimeout(() => {
          expect(spy).toHaveBeenCalledTimes(2);
          done();
        }, 0);
      }, 0);
    }, 10);
  });

  it('should use different scope to different usages', async () => {
    class T {
      @memoizeAsync<T, number>(20)
      one(): Promise<number> {
        return Promise.resolve(1);
      }

      @memoizeAsync<T, number>(20)
      two(): Promise<number> {
        return Promise.resolve(2);
      }
    }

    const t = new T();
    const one = t.one();
    const two = t.two();

    expect(await one).toBe(1);
    expect(await two).toBe(2);
  });
});
