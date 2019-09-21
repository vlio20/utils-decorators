import {debounce} from './debounce';

describe('debounce', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidDebounce: any = debounce(50);

      class T {
        @nonValidDebounce
        boo: string;
      }
    } catch (e) {
      expect('@debounce is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify method invocation is debounced', (done) => {
    class T {
      prop: number;

      @debounce<T>(15)
      foo(): void {
        return this.goo();
      }

      goo(): void {
        expect(this.prop)
          .toBe(3);

        return;
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    t.foo(); // 15

    setTimeout(() => {
      expect(spy).toBeCalledTimes(0);
      t.foo(); // 20
    }, 5);

    setTimeout(() => {
      expect(spy).toBeCalledTimes(0);
    }, 15);

    setTimeout(() => {
      expect(spy).toBeCalledTimes(1);
      done();
    }, 25);

    expect(spy).not.toBeCalled();
  });

  it('should verify method params are passed', (done) => {
    class T {
      @debounce<T>(5)
      foo(x: number, y: number): void {
        return this.goo(x, y);
      }

      goo(x: number, y: number): void {
        return;
      }
    }

    const t = new T();
    const spy = jest.spyOn(T.prototype, 'goo');
    t.foo(1, 2);

    setTimeout(() => {
      expect(spy).toHaveBeenCalledWith(1, 2);
      done();
    }, 10);
  });
});
