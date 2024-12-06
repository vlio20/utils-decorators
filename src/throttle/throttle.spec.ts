import { throttle } from './throttle';
import { sleep } from '../common/test-utils';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

describe('throttle', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidThrottle: any = throttle<T>(50);

      class T {
        @nonValidThrottle boo: string;
      }
    }, Error('@throttle is applicable only on a methods.'));
  });

  it('should verify method invocation is throttled', async () => {
    const spy = mock.fn();

    class T {
      prop: number;

      @throttle<T>(20)
      foo(x: number): void {
        return spy(x);
      }
    }

    const t = new T();
    t.prop = 3;

    t.foo(1);
    assert.equal(spy.mock.callCount(), 1);
    assert.equal(spy.mock.calls[0].arguments[0], 1);

    await sleep(10);

    t.foo(2);
    assert.equal(spy.mock.callCount(), 1);
    assert.equal(spy.mock.calls[0].arguments[0], 1);

    await sleep(30);

    t.foo(3);
    assert.equal(spy.mock.callCount(), 2);
    assert.equal(spy.mock.calls[1].arguments[0], 3);
  });
});
