import { memoize } from './memoize';
import { sleep } from '../common/test-utils';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

describe('memoize', () => {
  it('should verify memoize caching original method', (_, done) => {
    const spy = mock.fn((x: number, y: number) => x + y);

    class T {
      prop: 3;

      @memoize<T, number>(10)
      foo(x: number, y: number): number {
        return spy(x, y);
      }
    }

    const t = new T();
    t.prop = 3;

    const resp1 = t.foo(1, 2);
    const resp2 = t.foo(1, 2);
    const resp4 = t.foo(1, 3);

    assert.equal(spy.mock.callCount(), 2);
    assert.equal(spy.mock.calls[0].arguments[0], 1);
    assert.equal(spy.mock.calls[0].arguments[1], 2);
    assert.equal(spy.mock.calls[1].arguments[0], 1);
    assert.equal(spy.mock.calls[1].arguments[1], 3);

    setTimeout(async () => {
      const resp3 = t.foo(1, 2);

      assert.equal(spy.mock.callCount(), 3);
      assert.equal(resp1, 3);
      assert.equal(resp2, 3);
      assert.equal(resp3, 3);
      assert.equal(resp4, 4);
      done();
    }, 20);
  });

  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidMemoize: any = memoize<T, string>(50);

      class T {
        @nonValidMemoize boo: string;
      }
    }, Error('@memoize is applicable only on a methods.'));
  });

  it('should use provided cache', (_2, done) => {
    const cache = new Map<string, number>();
    const spy = mock.fn(() => 1);

    class T {
      @memoize<T, number>({ expirationTimeMs: 30, cache })
      foo(): number {
        return spy();
      }
    }


    const t = new T();
    t.foo();

    setTimeout(() => {
      t.foo();
      assert.equal(spy.mock.callCount(), 1);

      cache.delete('[]');
      t.foo();
      assert.equal(spy.mock.callCount(), 2);
      done();
    }, 10);
  });

  it('should verify memoize key foo as function', async () => {
    const mapper = mock.fn((x: string, y: string) => `${x}_${y}`);
    const spyFooWithMapper = mock.fn();

    class T {

      // eslint-disable-next-line class-methods-use-this
      @memoize<T, string>({ expirationTimeMs: 10, keyResolver: mapper })
      fooWithMapper(x: string, y: string): string {
        return spyFooWithMapper(x, y);
      }
    }

    const t = new T();


    t.fooWithMapper('x', 'y');
    t.fooWithMapper('x', 'y');

    assert.equal(mapper.mock.callCount(), 2);
    assert.equal(spyFooWithMapper.mock.callCount(), 1);
    assert.deepEqual(spyFooWithMapper.mock.calls[0].arguments, ['x', 'y']);
  });

  it('should verify memoize key foo as string - method name', async () => {
    const spyFooWithMapper = mock.fn((x: string, y: string) => x + y);
    const spyMapper = mock.fn((x: string, y: string) => `${x}_${y}`);

    class T {
      foo = spyMapper;

      // eslint-disable-next-line class-methods-use-this
      @memoize<T, string>({ expirationTimeMs: 10, keyResolver: 'foo' })
      fooWithInnerMapper(x: string, y: string): string {
        return spyFooWithMapper(x, y);
      }
    }

    const t = new T();

    t.fooWithInnerMapper('x', 'y');
    t.fooWithInnerMapper('x', 'y');

    assert.equal(spyMapper.mock.callCount(), 2);
    assert.equal(spyFooWithMapper.mock.callCount(), 1);
    assert(spyFooWithMapper.mock.calls[0].arguments[0] === 'x');
    assert(spyFooWithMapper.mock.calls[0].arguments[1] === 'y');
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
    assert.equal(cache.size, 1);

    await sleep(50);
    assert.equal(cache.size, 1);
  });
});
