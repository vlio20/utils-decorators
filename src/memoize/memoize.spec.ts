import {memoize} from './memoize';
import {memoizeAsync} from '..';

describe('memozie', () => {
  it('should verify memoize caching original method', (done) => {
    class T {
      @memoize<string>(10)
      foo(): string {
        return this.goo();
      }

      goo(): string {
        return 'yey';
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
      expect(resp1).toBe('yey');
      expect(resp2).toBe('yey');
      expect(resp3).toBe('yey');
      done();
    }, 20);
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidMemoize: any = memoize<string>(50);

      class T {
        @nonValidMemoize
        boo: string;
      }
    } catch (e) {
      expect('@memoize is applicable only on a methods.').toBe(e.message);
    }
  });

  it('should use provided cache', (done) => {
    const cache = new Map<string, number>();

    class T {
      @memoize<number>({expirationTimeMs: 30, cache})
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

  it('should verify memoize key mapper', async () => {
    const mapper = jest.fn((x: string, y: string) => {
      return `${x}_${y}`;
    });

    class T {
      @memoize<string>({expirationTimeMs: 10, keyResolver: mapper})
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
});
