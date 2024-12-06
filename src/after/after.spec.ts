import { after } from './after';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { assertCalls } from '../common/test-utils';
import { AfterParams } from './after.model';

describe('after', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidAfter: any = after({ func: null });

      class T {
        @nonValidAfter boo: string;
      }
    } catch (e) {
      assert.equal(e.message, '@after is applicable only on a methods.');

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify after method invocation with the right context when provided as string', () => {
    class T {
      prop: number;

      after = mock.fn();

      @after<T, void>({
        func: 'after',
      })
      foo(x: number): void {
        return this.goo(x);
      }

      goo = mock.fn();
    }

    const t = new T();
    t.prop = 3;

    t.foo(1);
    assertCalls(t.goo, [
      [[1]],
    ]);

    assertCalls(t.after, [
      [
        [
          {
            args: [1],
            response: undefined,
          },
        ],
      ],
    ]);
  });

  it('should verify after method invocation when function is provided', () => {
    const afterFunc = mock.fn();

    class T {
      @after<T, void>({
        func: afterFunc,
      })
      foo(x: number): number {
        return 2;
      }
    }

    const t = new T();
    t.foo(1);
    assertCalls(afterFunc, [
      [[{ args: [1], response: 2 }]],
    ]);
  });

  it('should verify after method invocation when method is provided without waiting for it to be resolved', async () => {
    const mocker = mock.fn();
    const afterFunc = mock.fn((args: AfterParams) => {
      mocker(2);
    });

    class T {
      @after<T, void>({
        func: afterFunc as any,
      })
      foo(x: number): Promise<void> {
        return new Promise((resolve) => {
          setTimeout(() => {
            mocker(1);
            resolve();
          }, 0);
        });
      }
    }

    const t = new T();
    await t.foo(1);
    assertCalls(mocker, [
      [[2]],
      [[1]],
    ]);
  });

  it('should verify after method invocation when method is provided with waiting for it to be resolved', async () => {
    const mocker = mock.fn();
    const afterFunc = mock.fn((args: AfterParams) => {
      mocker(2);
    });

    class T {
      @after<T, void>({
        func: afterFunc,
        wait: true,
      })
      foo(): Promise<void> {
        return new Promise((resolve) => {
          setTimeout(() => {
            mocker(1);
            resolve();
          }, 0);
        });
      }
    }

    const t = new T();
    await t.foo();
    assertCalls(mocker, [
      [[1]],
      [[2]],
    ]);
  });

  it('should provide args and response to after method - sync', () => {
    const afterFunc = mock.fn();

    class T {
      @after<T, number>({
        func: afterFunc,
      })
      foo(x: number, y: number): number {
        return x + y;
      }
    }

    const t = new T();
    t.foo(1, 2);

    assertCalls(afterFunc, [
      [[{ args: [1, 2], response: 3 }]],
    ]);
  });

  it('should provide args and response to after method - async', async () => {
    const afterFunc = mock.fn();

    class T {
      @after({
        func: afterFunc,
        wait: true,
      })
      foo(x: number, y: number): Promise<number> {
        return Promise.resolve(x + y);
      }
    }

    const t = new T();
    await t.foo(1, 2);

    assertCalls(afterFunc, [
      [[{ args: [1, 2], response: 3 }]],
    ]);
  });
});
