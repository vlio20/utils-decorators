import { multiDispatch } from './multi-dispatch';
import { sleep } from '../common/utils/utils';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('multi-dispatch', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidMultiDispatch: any = multiDispatch(50);

      class T {
        @nonValidMultiDispatch boo: string;
      }
    }, Error('@multiDispatch is applicable only on a methods.'));
  });

  it('should dispatch twice and resolve', async () => {
    class T {
      counter = 0;

      @multiDispatch(2)
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter === 1) {
          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    const res = await t.foo();
    assert.strictEqual(t.counter, 2);
    assert.strictEqual(res, 'yes');
  });

  it('should get last error if all rejected', async () => {
    class T {
      counter = 0;

      @multiDispatch(2)
      async foo(): Promise<string> {
        this.counter += 1;

        if (this.counter === 1) {
          await sleep(100);
          return Promise.reject(new Error('slowest'));
        }

        await sleep(50);
        return Promise.reject(new Error('fastest'));
      }
    }

    const t = new T();
    await assert.rejects(async () => {
      await t.foo();
    }, (err: Error) => {
      assert.strictEqual(t.counter, 2);
      assert.strictEqual(err.message, 'slowest');
      return true;
    });
  });

  it('should dispatch twice return faster', async () => {
    class T {
      counter = 0;

      @multiDispatch(2)
      async foo(): Promise<string> {
        this.counter += 1;

        if (this.counter === 1) {
          await sleep(100);
          return Promise.resolve('slow');
        }

        await sleep(50);
        return Promise.resolve('fast');
      }
    }

    const t = new T();
    const res = await t.foo();
    assert.strictEqual(t.counter, 2);
    assert.strictEqual(res, 'fast');
  });
});
