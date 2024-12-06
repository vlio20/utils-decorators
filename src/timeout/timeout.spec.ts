import { timeout } from './timeout';
import { sleep } from '../common/utils/utils';
import { TimeoutError } from './timeout.index';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('timeout', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidTimeout: any = timeout(50);

      class T {
        @nonValidTimeout boo: string;
      }
    }, Error('@timeout is applicable only on a methods.'));
  });

  it('should throw timeout exception after provided ms', async () => {
    const ms = 50;

    class T {
      @timeout(ms)
      async foo(): Promise<void> {
        await sleep(70);
      }
    }

    const t = new T();

    await assert.rejects(async () => {
      await t.foo();
    }, (e: TimeoutError) => {
      assert(e instanceof TimeoutError);
      assert.equal(e.message, `timeout occurred after ${ms}`);

      return true;
    });
  });

  it('should not throw timeout exception after provided ms', async () => {
    const ms = 100;

    class T {
      @timeout(ms)
      async foo(): Promise<number> {
        await sleep(50);
        return 1;
      }
    }

    const t = new T();
    const result = await t.foo();
    assert.equal(result, 1);
  });

  it('should catch original exception after the method throw an error within provided ms', async () => {
    const ms = 50;

    class T {
      @timeout(ms)
      async foo() {
        await Promise.reject(new Error('original error'));
        await sleep(100);
      }
    }

    const t = new T();

    try {
      await t.foo();
    } catch (e) {
      assert.strictEqual(e.message, 'original error');
    }
  });

  it('should catch timeout exception if the method throw an error after provided ms', async () => {
    const ms = 50;

    class T {
      @timeout(ms)
      async foo() {
        await sleep(100);
        await Promise.reject(1);
      }
    }

    const t = new T();

    try {
      await t.foo();
    } catch (e) {
      assert(e instanceof TimeoutError);
    }
  });
});
