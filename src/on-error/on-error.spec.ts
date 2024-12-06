import { onError } from './on-error';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

describe('onError', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidOnError: any = onError({ func: null });

      class T {
        @nonValidOnError boo: string;
      }
    }, Error('@onError is applicable only on a methods.'));
  });

  it('should verify onError called on exception, when as string', () => {
    const spyGoo = mock.fn((_: number) => {
      throw new Error('error');
    });
    const spyOnError = mock.fn((e: Error, args: any[]): void => {
      assert.equal(e.message, 'error');
      assert.deepEqual(args, [1]);

    });

    class T {
      prop = 3;

      @onError<T>({ func: 'onError' })
      foo(x: number): any {
        return spyGoo(x);
      }

      onError = (...args: any[]) => {
        assert.equal(this.prop, 3);
        spyOnError.apply(this, args);
      };
    }

    const t = new T();

    t.foo(1);
    assert.equal(spyGoo.mock.callCount(), 1);
    assert.equal(spyGoo.mock.calls[0].arguments[0], 1);
    assert.equal(spyGoo.mock.calls[0].arguments.length, 1);
    assert.equal(spyOnError.mock.callCount(), 1);
  });

  it('should verify onError called on exception, when as function', () => {
    const onErrorFunc = mock.fn((e: Error, args: any[]): void => {
      assert.equal(e.message, 'arr');
      assert.deepEqual(args, [1]);
    });
    const spyGoo = mock.fn((_: number) => {
      throw new Error('arr');
    });

    class T {
      @onError<T>({ func: onErrorFunc })
      foo(x: number): any {
        return spyGoo(x);
      }
    }

    const t = new T();

    t.foo(1);
    assert.equal(spyGoo.mock.callCount(), 1);
    assert.deepEqual(spyGoo.mock.calls[0].arguments, [1]);
    assert.equal(onErrorFunc.mock.callCount(), 1);
  });

  it('should verify onError called on exception, when function is async', async () => {
    const onErrorFunc = mock.fn(async (e: Error, args: any[]): Promise<void> => {
      assert.equal(e.message, 'error');
      assert.deepEqual(args, [1]);
    });

    class T {
      @onError<T>({ func: onErrorFunc })
      foo(_: number): Promise<void> {
        return Promise.reject(new Error('error'));
      }
    }

    const t = new T();

    await t.foo(1);
    assert.equal(onErrorFunc.mock.callCount(), 1);
  });

  it('should verify onError was not called when no error, and the function is async', async () => {
    const onErrorFunc = mock.fn(async (): Promise<void> => {
    });

    class T {
      @onError<T>({ func: onErrorFunc })
      foo(): Promise<void> {
        return Promise.resolve();
      }
    }

    const t = new T();

    await t.foo();
    assert.equal(onErrorFunc.mock.callCount(), 0);
  });

  it('should verify onError called on exception, when function is sync', () => {
    const onErrorFunc = mock.fn((e: Error, args: any[]): void => {
      assert.equal(e.message, 'arr');
      assert.deepEqual(args, [1]);
    });

    class T {
      @onError<T>({ func: onErrorFunc })
      foo(_: number): any {
        throw new Error('arr');
      }
    }

    const t = new T();

    t.foo(1);
    assert.equal(onErrorFunc.mock.callCount(), 1);
  });
});
