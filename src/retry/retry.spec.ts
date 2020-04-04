import {retry} from './retry';

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

      @retry(2)
      foo(): Promise<string> {
        if (this.counter === 0) {
          this.counter += 1;

          return Promise.reject(new Error('no'));
        } else {
          return Promise.resolve('yes');
        }
      }
    }

    const t = new T();
    const res = await t.foo();
    expect(t.counter).toEqual(1);
    expect(res).toEqual('yes');
  });
});
