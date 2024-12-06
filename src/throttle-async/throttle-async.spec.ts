import { sleep } from '../common/test-utils';
import { throttleAsync } from './throttle-async';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('throttle-async', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonThrottleAsync: any = throttleAsync(50);

      class T {
        @nonThrottleAsync boo: string;
      }
    }, Error('@throttleAsync is applicable only on a methods.'));
  });

  it('should verify method invocation is throttled 1', async () => {
    class T {
      prop = 0;

      @throttleAsync()
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(30);

        return x;
      }
    }

    await new Promise(async (resolve) => {
      const t = new T();

      assert.strictEqual(t.prop, 0);
      t.foo('a').then((res) => {
        assert.strictEqual(res, 'a');
      });
      assert.strictEqual(t.prop, 1);

      t.foo('b').then((res) => {
        assert.strictEqual(res, 'b');
        resolve(null);
      });

      assert.strictEqual(t.prop, 1);
      await sleep(20);
      assert.strictEqual(t.prop, 1);

      await sleep(50);
      assert.strictEqual(t.prop, 2);
    });

  });

  it('should verify method invocation is throttled 2', async () => {
    class T {
      prop = 0;

      @throttleAsync(2)
      async foo(): Promise<number> {
        this.prop += 1;
        await sleep(20);

        return this.prop;
      }
    }

    await new Promise((resolve) => {
      const t = new T();

      t.foo().then((res) => {
        assert.strictEqual(res, 2);
        assert.strictEqual(t.prop, 2);
      });

      t.foo().then((res) => {
        assert.strictEqual(res, 2);
        assert.strictEqual(t.prop, 2);
        resolve(null);
      });
    });
  });

  it('should work also with exceptions', async () => {
    class T {
      prop = 0;

      @throttleAsync()
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(30);

        if (this.prop === 1) {
          throw new Error('blarg');
        }

        return x;
      }
    }

    await new Promise((resolve) => {
      const t = new T();

      t.foo('a')
        .then(() => {
          throw new Error('should get to this point');
        })
        .catch((e: Error) => {
          assert.strictEqual(e.message, 'blarg');
        });

      t.foo('b')
        .then((res) => {
          assert.strictEqual(res, 'b');
          resolve(null);
        });
    });
  });

  it('should validate methods invoked in time', async () => {
    class T {
      prop = 0;

      @throttleAsync(2)
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(20);

        return x;
      }
    }

    const t = new T();

    t.foo('a');
    assert.strictEqual(t.prop, 1);
    t.foo('b');
    assert.strictEqual(t.prop, 2);

    await sleep(30);
    t.foo('c');
    assert.strictEqual(t.prop, 3);

    const val = await t.foo('d');
    assert.strictEqual(t.prop, 4);
    assert.strictEqual(val, 'd');
  });

  it('should validate methods invoked between times', async () => {
    class T {
      prop = 0;

      @throttleAsync(2)
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(100);

        return x;
      }
    }

    const start = new Date();
    const t = new T();
    t.foo('a');
    t.foo('b');
    t.foo('c');
    t.foo('d');
    t.foo('e');
    t.foo('f');
    t.foo('g');
    t.foo('h');
    t.foo('j');

    await t.foo('k');
    const seconds = (new Date().getTime() - start.getTime()) / 1000;
    assert(seconds >= 0.5 && seconds < 0.6);
  });
});