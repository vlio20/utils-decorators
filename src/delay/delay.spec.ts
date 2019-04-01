import {delay} from './delay';

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
    }
  });

  it('should verify method invocation is delayed', (done) => {
    class T {
      prop: number;

      @delay(5)
      foo(): void {
        return this.goo();
      }

      goo(): void {
        expect(this.prop).toBe(3);

        return;
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    t.foo();

    setTimeout(() => {
      t.foo();
      expect(spy).toBeCalledTimes(1);
    }, 10);

    expect(spy).not.toBeCalled();

    setTimeout(async () => {
      expect(spy).toBeCalledTimes(2);
      done();
    }, 20);
  });
});
