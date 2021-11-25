import { after } from './after';
import { AfterFunc, AfterParams } from './after.model';

describe('after', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidAfter: any = after({ func: null });

      class T {
        @nonValidAfter
          boo: string;
      }
    } catch (e) {
      expect('@after is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify after method invocation with the right context when provided as string', () => {
    let counter = 0;

    class T {
      prop: number;

      after(): void {
        expect(this.prop).toBe(3);
        expect(counter).toBe(1);
      }

      @after<T, void>({
        func: 'after',
      })
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(this.prop).toBe(3);
        expect(counter).toBe(0);
        counter += 1;
      }
    }

    const t = new T();
    t.prop = 3;
    const spyGoo = jest.spyOn(T.prototype, 'goo');
    const spyAfter = jest.spyOn(T.prototype, 'after');

    t.foo(1);
    expect(spyGoo).toBeCalledTimes(1);
    expect(spyGoo).toBeCalledWith(1);
    expect(spyAfter).toBeCalledTimes(1);
  });

  it('should verify after method invocation when method is provided', () => {
    let counter = 0;

    const afterFunc = jest.fn(() => {
      expect(counter).toBe(1);
    });

    class T {
      @after<T, void>({
        func: afterFunc,
      })
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(counter).toBe(0);
        counter += 1;
      }
    }

    const t = new T();
    const spyGoo = jest.spyOn(T.prototype, 'goo');

    t.foo(1);
    expect(spyGoo).toBeCalledTimes(1);
    expect(spyGoo).toBeCalledWith(1);
    expect(afterFunc.mock.calls.length).toBe(1);
  });

  it('should verify after method invocation when method is provided without waiting for it to be resolved', (done) => {
    let counter = 0;

    const afterFunc = jest.fn(() => {
      expect(counter).toBe(1);
      counter += 1;
    });

    class T {
      @after<T, void>({
        func: afterFunc,
      })
      foo(x: number): Promise<void> {
        expect(counter).toBe(0);
        counter += 1;

        return new Promise((resolve) => {
          setTimeout(() => {
            expect(counter).toBe(2);
            resolve();
            done();
          }, 0);
        });
      }
    }

    const t = new T();
    t.foo(1);
  });

  it('should verify after method invocation when method is provided with waiting for it to be resolved', (done) => {
    let counter = 0;

    const afterFunc = jest.fn(() => {
      expect(counter).toBe(2);
      done();
    });

    class T {
      @after<T, void>({
        func: afterFunc,
        wait: true,
      })
      foo(): Promise<void> {
        expect(counter).toBe(0);
        counter += 1;

        return new Promise((resolve) => {
          setTimeout(() => {
            expect(counter).toBe(1);
            counter += 1;
            resolve();
          }, 0);
        });
      }
    }

    const t = new T();
    t.foo();
  });

  it('should provide args and response to after method - sync', (done) => {
    const testable1 = 5;
    const testable2 = 6;

    const afterFunc: AfterFunc<number> = (x: AfterParams<number>): void => {
      expect(x.args.length).toBe(2);
      expect(x.args[0]).toBe(testable1);
      expect(x.args[1]).toBe(testable2);
      expect(x.response).toBe(testable1 + testable2);
      done();
    };

    class T {
      @after<T, number>({
        func: afterFunc,
      })
      foo(x: number, y: number): number {
        return x + y;
      }
    }

    const t = new T();
    t.foo(testable1, testable2);
  });

  it('should provide args and response to after method - async', async () => {
    const testable1 = 5;
    const testable2 = 6;

    const afterFunc: AfterFunc<number> = (x: AfterParams<number>): void => {
      expect(x.args.length).toBe(2);
      expect(x.args[0]).toBe(testable1);
      expect(x.args[1]).toBe(testable2);
      expect(x.response).toBe(testable1 + testable2);
    };

    class T {
      @after({
        func: afterFunc,
        wait: true,
      })
      foo(x: number, y: number): Promise<number> {
        return Promise.resolve(x + y);
      }
    }

    const t = new T();
    await t.foo(testable1, testable2);
  });

  it('should returned result of method', async () => {
    const value = 42;

    const afterFunc: AfterFunc<number> = jest.fn((x: AfterParams<number>) => {
      expect(x.response).toBe(value);
    });

    class T {
      @after<T>({
        func: afterFunc,
      })
      foo(x: number): number {
        return x;
      }
    }

    const t = new T();
    const result = await t.foo(value);
    expect(result).toBe(value);
  });
});
