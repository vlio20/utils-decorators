import {timeout} from './timeout';
import {sleep} from '../common/utils/utils';

describe('timeout', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidTimeout: any = timeout(50);

      class T {
        @nonValidTimeout
        boo: string;
      }
    } catch (e) {
      expect('@timeout is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should throw timeout exception after provided ms', async () => {
    const ms = 50;

    class T {
      @timeout(ms)
      async foo(): Promise<void> {
        await sleep(100);
      }
    }

    const t = new T();

    try {
      await t.foo();
      throw new Error('should not reach here');
    } catch (e) {
      expect(e.message).toEqual(`timeout occurred after ${ms}`);
      expect(e instanceof TimeoutError).toBeTruthy();
    }
  });

  it('should no throw timeout exception after provided ms', async () => {
    const ms = 100;

    class T {
      @timeout(ms)
      async foo(): Promise<number> {
        await sleep(50);

        return Promise.resolve(1);
      }
    }

    const t = new T();
    expect(await t.foo()).toEqual(1);
  });
});
