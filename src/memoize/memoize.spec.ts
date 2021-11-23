import { memoize } from './memoize';
import { sleep } from '../common/test-utils';

declare const window: any;

describe('memozie', () => {
  it('should verify memoize caching original method', (done) => {
    class T {
      prop: 3;

      @memoize<T, number>(10)
      foo(x: number, y: number): number {
        return this.goo(x, y);
      }

      goo(x: number, y: number): number {
        expect(this.prop).toBe(3);

        return x + y;
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    const resp1 = t.foo(1, 2);
    const resp2 = t.foo(1, 2);
    const resp4 = t.foo(1, 3);

    expect(spy).toBeCalledTimes(2);
    expect(spy.mock.calls[0][0]).toBe(1);
    expect(spy.mock.calls[0][1]).toBe(2);
    expect(spy.mock.calls[1][0]).toBe(1);
    expect(spy.mock.calls[1][1]).toBe(3);

    setTimeout(async () => {
      const resp3 = t.foo(1, 2);

      expect(spy).toBeCalledTimes(3);
      expect(resp1).toBe(3);
      expect(resp2).toBe(3);
      expect(resp3).toBe(3);
      expect(resp4).toBe(4);
      done();
    }, 20);
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidMemoize: any = memoize<T, string>(50);

      class T {
        @nonValidMemoize
          boo: string;
      }
    } catch (e) {
      expect('@memoize is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should use provided cache', (done) => {
    const cache = new Map<string, number>();

    class T {
      @memoize<T, number>({ expirationTimeMs: 30, cache })
      foo(): number {
        return this.goo();
      }

      goo(): number {
        return 1;
      }
    }

    const spy = jest.spyOn(T.prototype, 'goo');

    const t = new T();
    t.foo();

    setTimeout(() => {
      t.foo();
      expect(spy).toHaveBeenCalledTimes(1);

      cache.delete('[]');
      t.foo();
      expect(spy).toHaveBeenCalledTimes(2);
      done();
    }, 10);
  });

  it('should verify memoize key foo as function', async () => {
    const mapper = jest.fn((x: string, y: string) => `${x}_${y}`);

    class T {
      @memoize<T, string>({ expirationTimeMs: 10, keyResolver: mapper })
      fooWithMapper(x: string, y: string): string {
        return this.goo(x, y);
      }

      goo(x: string, y: string): string {
        return x + y;
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

  it('should verify memoize key foo as string - method name', async () => {
    class T {
      foo(x: string, y: string): string {
        return `${x}_${y}`;
      }

      @memoize<T, string>({ expirationTimeMs: 10, keyResolver: 'foo' })
      fooWithInnerMapper(x: string, y: string): string {
        return this.goo(x, y);
      }

      goo(x: string, y: string): string {
        return x + y;
      }
    }

    const t = new T();
    const spyFooWithMapper = jest.spyOn(T.prototype, 'goo');
    const spyMapper = jest.spyOn(T.prototype, 'foo');

    t.fooWithInnerMapper('x', 'y');
    t.fooWithInnerMapper('x', 'y');

    expect(spyMapper).toHaveBeenCalledTimes(2);
    expect(spyFooWithMapper).toHaveBeenCalledTimes(1);
    expect(spyFooWithMapper).toHaveBeenCalledWith('x', 'y');
  });

  it('should verify that by default the cache is never cleaned', async () => {
    const cache = new Map();

    class T {
      @memoize<T, number>({ cache })
      foo(): number {
        return 1;
      }
    }

    const t = new T();

    t.foo();
    expect(cache.size).toEqual(1);

    await sleep(50);
    expect(cache.size).toEqual(1);
  });
});
