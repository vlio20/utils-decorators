import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { assertCalls, assertNotCalled } from '../common/test-utils';
import { before } from './before';

describe('before', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidBefore: any = before({ func: null });

      class T {
        @nonValidBefore boo: string;
      }
    } catch (e) {
      assert.equal(e.message, '@before is applicable only on a methods.');

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify before method invocation with the right context when provided as string', () => {
    const mocker = mock.fn();

    class T {
      before = mock.fn(() => {
        mocker(2);
      });

      @before<T>({
        func: 'before',
      })
      foo(x: number): void {
        mocker(1);
      }
    }

    const t = new T();
    t.foo(1);
    assertCalls(mocker, [
      [[2]],
      [[1]],
    ]);
    assertCalls(t.before, [
      [[]],
    ]);
  });

  it('should verify before method invocation when method is provided without waiting for it to be resolved', async () => {
    const mocker = mock.fn();
    const promise = new Promise((resolve) => {
      resolve(null);
    });
    const beforeFunc = mock.fn(async () => {
      mocker(2);
      await promise;
      mocker(4);
    });

    class T {
      @before<T>({
        func: beforeFunc,
      })
      foo(x: number): void {
        return mocker(1);
      }
    }

    const t = new T();
    t.foo(1);
    mocker(3);
    await promise;
    assertCalls(mocker, [
      [[2]],
      [[1]],
      [[3]],
      [[4]],
    ]);
  });

  it('should verify before method invocation when method is provided with waiting for it to be resolved', (ctx, done) => {
    const mocker = mock.fn();
    const promise = new Promise<void>((resolve) => {
      mocker(0);
      resolve();
      mocker(2);
    });
    const beforeFunc = mock.fn(async () => {
      await promise;
    });

    class T {
      @before<T>({
        func: beforeFunc,
        wait: true,
      })
      foo(): void {
        mocker(1);
        assertCalls(mocker, [
          [[0]],
          [[2]],
          [[1]],
        ]);
        done();
      }
    }

    const t = new T();
    t.foo();
  });

  it('should returned result of method', () => {
    class T {
      @before<T>({
        func: () => {
        },
      })
      foo(x: number): number {
        return x;
      }
    }

    const t = new T();
    assert.equal(t.foo(42), 42);
  });

  it('should throw error if before is throwing an error', async () => {
    const mocker = mock.fn();
    const error = new Error('Rejecting');
    const beforeCall = mock.fn(() => {
      return Promise.reject(error);
    });

    class T {
      @before({
        func: beforeCall,
        wait: true,
      })
      async foo(): Promise<void> {
        mocker();
      }
    }

    const t = new T();
    await assert.rejects(t.foo, error);
    assertCalls(beforeCall, [
      [[]],
    ]);
    assertNotCalled(mocker);
  });
});
