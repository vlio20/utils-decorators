import { throttle } from './throttle';
import { sleep } from '../common/test-utils';

describe('throttle', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidThrottle: any = throttle<T>(50);

      class T {
        @nonValidThrottle
        boo: string;
      }
    } catch (e) {
      expect('@throttle is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify method invocation is throttled', async (done) => {
    class T {
      prop: number;

      @throttle<T>(20)
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
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(1);

    await sleep(10);

    t.foo(2);
    expect(spy).toBeCalledTimes(1);
    expect(spy).lastCalledWith(1);

    await sleep(30);

    t.foo(3);

    expect(spy).toBeCalledTimes(2);
    expect(spy).lastCalledWith(3);

    done();
  });
});
