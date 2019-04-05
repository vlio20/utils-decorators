import {throttle} from './throttle';

describe('throttle', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidThrottle: any = throttle(50);

      class T {
        @nonValidThrottle
        boo: string;
      }
    } catch (e) {
      expect('@throttle is applicable only on a methods.').toBe(e.message);
    }
  });

  it('should verify method invocation is throttled', (done) => {
    class T {
      prop: number;

      @throttle(15)
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(this.prop).toBe(3);

        return;
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    t.foo(1);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(1);

    setTimeout(() => {
      t.foo(2);
      expect(spy).toBeCalledTimes(1);
      expect(spy).lastCalledWith(1);
    }, 5);

    setTimeout(() => {
      t.foo(3);
      expect(spy).toBeCalledTimes(2);
      expect(spy).lastCalledWith(3);
      done();
    }, 20);
  });
});
