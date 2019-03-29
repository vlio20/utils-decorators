import {memoizeAsync} from './memozie-async';

describe('memozie-async', () => {
  it('should verify memoize async caching original method', async (done) => {
    class T {
      @memoizeAsync<string>(10)
      foo(): Promise<string> {
        return this.goo();
      }

      goo(): Promise<string> {
        return Promise.resolve('yey');
      }
    }

    const t = new T();
    const spy = jest.spyOn(T.prototype, 'goo');
    const resp1 = t.foo();
    const resp2 = t.foo();

    expect(spy).toBeCalledTimes(1);

    setTimeout(async () => {
      const resp3 = t.foo();

      expect(spy).toBeCalledTimes(2);
      expect(await resp1).toBe('yey');
      expect(await resp2).toBe('yey');
      expect(await resp3).toBe('yey');
      done();
    }, 20);
  });

  it('should verify memoize key mapper', async () => {
    const mapper = jest.fn((x: string, y: string) => {
      return `${x}_${y}`;
    });

    class T {
      @memoizeAsync<string>(50, mapper)
      fooWithMapper(x: string, y: string): Promise<string> {
        return this.goo(x, y);
      }

      goo(x: string, y: string): Promise<string> {
        return Promise.resolve(x + y)
      }
    }

    const t = new T();
    const spyFooWithMapper = jest.spyOn(T.prototype, 'goo');

    t.fooWithMapper('x', 'y');
    t.fooWithMapper('x', 'y');

    expect(mapper.mock.calls.length).toBe(2);
    expect(spyFooWithMapper).toHaveBeenCalledTimes(1);
    expect(spyFooWithMapper).toHaveBeenCalledWith('x', 'y');
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      class T {
        @memoizeAsync<string>(50)
        boo: string;
      }
    } catch (e) {
      expect('@memoizeAsync is applicable only on a methods.').toBe(e.message);
    }
  });

  it('should make sure that when promise rejected it is removed from cache', (done) => {
    class T {
      @memoizeAsync<string>(100)
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
      
      expect(spy).toHaveBeenCalledTimes(2);
      done();
    }, 20);
  });
});
