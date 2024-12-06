import { debounce } from './debounce';
import { sleep } from '../common/test-utils';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

describe('debounce', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidDebounce: any = debounce(50);

      class T {
        @nonValidDebounce boo: string;
      }
    }, Error('@debounce is applicable only on a methods.'));
  });

  it('should verify method invocation is debounced', async () => {
    const goo = mock.fn();

    class T {
      prop: number;

      @debounce<T>(50)
      foo(x: number): void {
        return goo(x);
      }
    }

    const t = new T();
    t.prop = 3;
    t.foo(1);
    t.foo(2);

    await sleep(20);
    assert.equal(goo.mock.callCount(), 0);

    await sleep(50);

    t.foo(3);
    assert.equal(goo.mock.callCount(), 1);
    assert.equal(goo.mock.calls[0].arguments.length, 1);
    assert.equal(goo.mock.calls[0].arguments[0], 2);

    await sleep(75);

    assert.equal(goo.mock.callCount(), 2);
  });
});