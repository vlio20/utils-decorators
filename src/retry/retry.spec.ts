import { retry } from './retry';
import { sleep } from '../common/test-utils';
import { retryfy } from './retryfy';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

describe('retry', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidRetry: any = retry(50);

      class T {
        @nonValidRetry boo: string;
      }
    }, Error('@retry is applicable only on a methods.'));
  });

  it('should retry twice', async () => {
    class T {
      counter = 0;

      @retry({
        retries: 2,
        delay: 10,
      })
      foo(): Promise<string> {
        if (this.counter === 0) {
          this.counter += 1;
          return Promise.reject(new Error('no'));
        }
        return Promise.resolve('yes');
      }
    }

    const t = new T();
    const res = await t.foo();
    assert.strictEqual(t.counter, 1);
    assert.strictEqual(res, 'yes');
  });

  it('should throw exception after retries', async () => {
    class T {
      counter = 0;

      @retry({
        retries: 2,
        delay: 10,
      })
      foo(): Promise<string> {
        this.counter += 1;
        return Promise.reject(new Error('no'));
      }
    }

    const t = new T();
    await assert.rejects(async () => {
      await t.foo();
    }, Error('no'));
    assert.strictEqual(t.counter, 3);
  });

  it('should wait according to configured delay', async () => {
    class T {
      counter = 0;

      @retry({
        retries: 2,
        delay: 50,
      })
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter < 3) {
          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    t.foo();
    await sleep(25);
    assert.strictEqual(t.counter, 1);
    await sleep(50);
    assert.strictEqual(t.counter, 2);
    await sleep(75);
    assert.strictEqual(t.counter, 3);
  });

  it('should wait according to retries array', async () => {
    class T {
      counter = 0;

      @retry([50, 100])
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter !== 3) {
          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    t.foo();
    await sleep(25);
    assert.strictEqual(t.counter, 1);
    await sleep(50);
    assert.strictEqual(t.counter, 2);
    await sleep(150);
    assert.strictEqual(t.counter, 3);
  });

  it('should wait according to retries object with delaysArray', async () => {
    class T {
      counter = 0;

      @retry({
        delaysArray: [50, 100],
      })
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter !== 3) {
          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    t.foo();
    await sleep(25);
    assert.strictEqual(t.counter, 1);
    await sleep(50);
    assert.strictEqual(t.counter, 2);
    await sleep(150);
    assert.strictEqual(t.counter, 3);
  });

  it('should wait 1 sec by default', async () => {
    class T {
      counter = 0;

      @retry(1)
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter === 1) {
          return Promise.reject(new Error('no'));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();
    const prom = t.foo();
    await sleep(500);
    assert.strictEqual(t.counter, 1);
    await sleep(600);
    assert.strictEqual(t.counter, 2);

    const res = await prom;
    assert.strictEqual(res, 'yes');
    assert.strictEqual(t.counter, 2);
  });

  it('should throw error when invalid input', () => {
    assert.throws(() => {
      (retryfy as any)('6');
    }, new Error('invalid input'));
  });

  it('should invoke onRetry', async () => {
    const onRetry = mock.fn();

    class T {
      counter = 0;

      decCounter = 0;

      @retry({
        retries: 3,
        delay: 10,
        onRetry,
      })
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter < 3) {
          return Promise.reject(new Error(`no ${this.counter}`));
        }

        return Promise.resolve('yes');
      }

      @retry({
        retries: 3,
        delay: 10,
        onRetry: 'retry',
      })
      goo(): Promise<void> {
        if (this.decCounter < 3) {
          return Promise.reject(new Error(`no ${this.decCounter}`));
        }

        return Promise.resolve();
      }

      retry(): void {
        this.decCounter += 1;
      }
    }

    const t = new T();
    await t.foo();
    await t.goo();
    await sleep(100);

    assert.equal(onRetry.mock.callCount(), 2);
    const argsFirstCall = onRetry.mock.calls[0];
    assert.equal(argsFirstCall.arguments[0].message, 'no 1');
    assert.equal(argsFirstCall.arguments[1], 0);

    const argsSecondCall = onRetry.mock.calls[1];
    assert.equal(argsSecondCall.arguments[0].message, 'no 2');
    assert.equal(argsSecondCall.arguments[1], 1);

    assert.equal(t.decCounter, 3);
  });

  it('should throw error when provided both retries and delaysArray', () => {
    assert.throws(() => {
      class T {
        @retry({
          retries: 3,
          delaysArray: [1, 2, 3],
        })
        boo(): Promise<void> {
          return Promise.resolve();
        }
      }
    }, new Error('You can not provide both retries and delaysArray'));
  });

  it('should fill the delays with 1000ms by default', async () => {
    class T {
      counter = 0;

      @retry({
        retries: 1,
      })
      foo(): Promise<string> {
        this.counter += 1;

        if (this.counter < 2) {
          return Promise.reject(new Error(`no ${this.counter}`));
        }

        return Promise.resolve('yes');
      }
    }

    const t = new T();

    t.foo();
    await sleep(500);
    assert.strictEqual(t.counter, 1);
    await sleep(600);
    assert.strictEqual(t.counter, 2);
  });
});
