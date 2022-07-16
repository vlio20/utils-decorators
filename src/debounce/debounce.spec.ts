import { debounce } from './debounce';
import { sleep } from '../common/test-utils';

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

  it('should verify method invocation is debounced', async () => {
    class T {
      prop: number;

      @debounce<T>(30)
      foo(): void {
        return this.goo();
      }

      goo(): void {
        expect(this.prop).toBe(3);
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    t.foo(); // 15

    expect(spy).not.toBeCalled();

    await sleep(10);
    expect(spy).toBeCalledTimes(0);
    t.foo(); // 20

    await sleep(20);
    expect(spy).toBeCalledTimes(0);

    await sleep(40);
    expect(spy).toBeCalledTimes(1);
  });

  it('should verify method params are passed', (done) => {
    class T {
      @debounce<T>(5)
      foo(x: number, y: number): void {
        return this.goo(x, y);
      }

      goo(x: number, y: number): void {

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

  it('should multi instances working', async () => {
    class T {

      @debounce<T>(30)
      foo(): void {
        return this.goo();
      }

      goo(): void {
      }
    }

    const t1 = new T();
    const t2 = new T();
    const spy1 = jest.spyOn(t1, 'goo');
    const spy2 = jest.spyOn(t1, 'goo');
    t1.foo();

    expect(spy1).not.toBeCalled();
    expect(spy2).not.toBeCalled();

    await sleep(10);
    expect(spy1).not.toBeCalled();
    t2.foo(); // 20

    await sleep(30); // 40
    expect(spy1).toBeCalledTimes(1);

    await sleep(30); // 70
    expect(spy1).toBeCalledTimes(1);
    expect(spy2).toBeCalledTimes(1);
  });
});
