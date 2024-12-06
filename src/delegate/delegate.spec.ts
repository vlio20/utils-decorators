import { delegate } from './delegate';
import { sleep } from '../common/test-utils';
import assert from 'node:assert';
import { describe, it } from 'node:test';

describe('delegate', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidDelegate: any = delegate();

      class T {
        @nonValidDelegate boo: string;
      }
    }, Error('@delegate is applicable only on a methods.'));
  });

  it('should delegate method with same key invocation', async () => {
    let counter = 0;

    class T {
      @delegate()
      async foo(): Promise<number> {
        counter += 1;
        await sleep(20);

        return Promise.resolve(1);
      }
    }

    const t = new T();
    t.foo();
    t.foo();

    const res = await Promise.all([t.foo(), t.foo()]);
    assert.deepEqual(res, [1, 1]);
    assert.strictEqual(counter, 1);
  });

  it('should delegate method with same key invocation until delegator is resolved / rejected', async () => {
    const timestampBeforeTest = Date.now();
    let counter = 0;

    class T {
      @delegate()
      async foo(): Promise<number> {
        counter += 1;
        await sleep(20);

        return Date.now();
      }
    }

    const t = new T();
    t.foo();
    t.foo();

    const res0 = await Promise.all([t.foo(), t.foo()]);
    assert.strictEqual(res0[0], res0[1]);
    assert.strictEqual(res0[0] > timestampBeforeTest, true);
    assert.strictEqual(counter, 1);

    t.foo();
    t.foo();

    const res1 = await Promise.all([t.foo(), t.foo()]);
    assert.notEqual(res1, res0);

    assert.strictEqual(res1[0], res1[1]);
    assert.strictEqual(res1[0] > res0[0], true);
    assert.strictEqual(counter, 2);
  });

  it('should delegate method with same key invocation - default key serialization', async () => {
    let counter = 0;

    class T {
      @delegate()
      async foo(x: string): Promise<string> {
        counter += 1;
        await sleep(20);

        return Promise.resolve(x);
      }
    }

    const t = new T();

    const res = await Promise.all([t.foo('a'), t.foo('a'), t.foo('b')]);
    assert.deepEqual(res, ['a', 'a', 'b']);
    assert.strictEqual(counter, 2);
  });

  it('should delegate method with same key invocation - default key serialization - many args', async () => {
    let counter = 0;

    class T {
      @delegate()
      async foo(...args: number[]): Promise<number> {
        counter += 1;
        await sleep(20);

        return Promise.resolve(args.reduce((a, b) => a + b));
      }
    }

    const t = new T();

    const res = await Promise.all([
      t.foo(1, 1, 1, 1),
      t.foo(1, 1, 1, 2),
      t.foo(1, 1, 1, 1),
    ]);
    assert.deepEqual(res, [4, 5, 4]);
    assert.strictEqual(counter, 2);
  });

  it('should delegate method with same key invocation - custom serialization', async () => {
    let counter = 0;

    class T {
      @delegate((a: number, b: number) => `${a}_${b}`)
      async foo(a: number, b: number): Promise<number> {
        counter += 1;
        await sleep(20);

        return Promise.resolve(a + b);
      }
    }

    const t = new T();

    const res = await Promise.all([t.foo(1, 1), t.foo(2, 1), t.foo(1, 1)]);
    assert.deepEqual(res, [2, 3, 2]);
    assert.equal(counter, 2);
  });

  it('should have the correct context', async () => {
    class Example {
      static ex2(): Promise<number> {
        return Promise.resolve(2);
      }

      @delegate()
      static async ex1(): Promise<number> {
        return Example.ex2();
      }
    }

    const result = await Example.ex1();

    assert.equal(result, 2);
  });
});
