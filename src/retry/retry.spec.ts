import {retry} from './retry';
import {sleep} from '../common/test-utils';

describe('retry', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidRetry: any = retry(50);

      class T {
        @nonValidRetry
        boo: string;
      }
    } catch (e) {
      expect('@retry is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
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
    expect(t.counter).toEqual(1);
    expect(res).toEqual('yes');
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
    try {
      await t.foo();
      throw new Error('should not get hear');
    } catch (e) {
      expect(t.counter).toEqual(3);
      expect(e.message).toEqual('no');
    }
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
    expect(t.counter).toEqual(1);
    await sleep(50);
    expect(t.counter).toEqual(2);
    await sleep(75);
    expect(t.counter).toEqual(3);
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
    expect(t.counter).toEqual(1);
    await sleep(50);
    expect(t.counter).toEqual(2);
    await sleep(150);
    expect(t.counter).toEqual(3);
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
    expect(t.counter).toEqual(1);
    await sleep(600);
    expect(t.counter).toEqual(2);

    expect(await prom).toEqual('yes');
    expect(t.counter).toEqual(2);
  });

  it('should throw error when invalid input', async () => {
    expect(retry.bind(this, '6')).toThrowError('invalid input');
  });
});
