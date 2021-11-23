import { delay } from './delay';
import { sleep } from '../common/test-utils';

describe('delay', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidDelay: any = delay(50);

      class T {
        @nonValidDelay
          boo: string;
      }
    } catch (e) {
      expect('@delay is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify method invocation is delayed', async (done) => {
    class T {
      prop: number;

      @delay<T>(50)
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(this.prop).toBe(3);
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    t.foo(1);

    await sleep(20);
    expect(spy).not.toBeCalled();

    await sleep(50);

    t.foo(2);
    expect(spy).toBeCalledTimes(1);
    expect(spy).lastCalledWith(1);

    await sleep(75);

    expect(spy).toBeCalledTimes(2);
    done();
  });
});
