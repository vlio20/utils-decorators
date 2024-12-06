import { delay } from './delay';
import { sleep } from '../common/test-utils';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

describe('delay', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidDelay: any = delay(50);

      class T {
        @nonValidDelay boo: string;
      }
    }, Error('@delay is applicable only on a methods.'));
  });

  it('should verify method invocation is delayed', async () => {
    const goo = mock.fn();

    class T {
      prop: number;

      @delay<T>(50)
      foo(x: number): void {
        return goo(x);
      }
    }

    const t = new T();
    t.prop = 3;
    t.foo(1);

    await sleep(20);
    assert.strictEqual(goo.mock.callCount(), 0);

    await sleep(50);

    t.foo(2);
    assert.strictEqual(goo.mock.callCount(), 1);
    assert.equal(goo.mock.calls[0].arguments.length, 1);
    assert.equal(goo.mock.calls[0].arguments[0], 1);

    await sleep(75);

    assert.strictEqual(goo.mock.callCount(), 2);
  });
});