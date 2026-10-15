import { multiDispatch } from './multi-dispatch';
import { sleep } from '../common/utils/utils';

describe('retry', () => {
  it('should forward every argument and the receiver to each dispatch', async () => {
    const calls: number[][] = [];
    class T {
      base = 10;

      @multiDispatch(2)
      async foo(x: number, y: number): Promise<number> {
        calls.push([this.base, x, y]);
        return this.base + x + y;
      }
    }

    await expect(new T().foo(2, 3)).resolves.toBe(15);
    expect(calls).toEqual([[10, 2, 3], [10, 2, 3]]);
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidMultiDispatch: any = multiDispatch(50);

      class T {
        @nonValidMultiDispatch
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@multiDispatch is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
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
    expect(t.counter).toEqual(2);
    expect(res).toEqual('yes');
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
    try {
      await t.foo();
      throw new Error('should not reach here');
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(t.counter).toEqual(2);
      expect(e.message).toEqual('slowest');
    }
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
    expect(t.counter).toEqual(2);
    expect(res).toEqual('fast');
  });
});
