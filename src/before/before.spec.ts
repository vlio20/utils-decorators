import { before } from './before';

describe('before', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidBefore: any = before({ func: null });

      class T {
        @nonValidBefore
        boo: string;
      }
    } catch (e) {
      expect('@before is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify before method invocation with the right context when provided as string', () => {
    let counter = 0;

    class T {
      prop: number;

      before(): void {
        expect(this.prop).toBe(3);
        expect(counter).toBe(0);
        counter += 1;
      }

      @before<T>({
        func: 'before',
      })
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(this.prop).toBe(3);
        expect(counter).toBe(1);
      }
    }

    const t = new T();
    t.prop = 3;
    const spyGoo = jest.spyOn(T.prototype, 'goo');
    const spyBefore = jest.spyOn(T.prototype, 'before');

    t.foo(1);
    expect(spyGoo).toBeCalledTimes(1);
    expect(spyGoo).toBeCalledWith(1);
    expect(spyBefore).toBeCalledTimes(1);
  });

  it('should verify before method invocation when method is provided', () => {
    let counter = 0;

    const beforeFunc = jest.fn(() => {
      expect(counter).toBe(0);
      counter += 1;
    });

    class T {
      @before<T>({
        func: beforeFunc,
      })
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(counter).toBe(1);
      }
    }

    const t = new T();
    const spyGoo = jest.spyOn(T.prototype, 'goo');

    t.foo(1);
    expect(spyGoo).toBeCalledTimes(1);
    expect(spyGoo).toBeCalledWith(1);
    expect(beforeFunc.mock.calls.length).toBe(1);
  });

  it('should verify before method invocation when method is provided without waiting for it to be resolved', (done) => {
    let counter = 0;

    const beforeFunc = jest.fn(() => new Promise((resolve) => {
      setTimeout(() => {
        expect(counter).toBe(1);
        resolve(null);
        done();
      }, 0);
    }));

    class T {
      @before<T>({
        func: beforeFunc,
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
    t.foo(1);
  });

  it('should verify before method invocation when method is provided with waiting for it to be resolved', (done) => {
    let counter = 0;

    const beforeFunc = jest.fn(() => new Promise((resolve) => {
      setTimeout(() => {
        expect(counter).toBe(0);
        counter += 1;
        resolve(null);
        done();
      }, 10);
    }));

    class T {
      @before<T>({
        func: beforeFunc,
        wait: true,
      })
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(counter).toBe(1);
      }
    }

    const t = new T();
    t.foo(1);
  });

  it('should returned result of method', async () => {
    let counter = 0;

    const beforeFunc = jest.fn(() => {
      expect(counter).toBe(0);
      counter += 1;
    });

    class T {
      @before<T>({
        func: beforeFunc,
      })
      foo(x: number): number {
        return x;
      }
    }

    const t = new T();
    const value = 42;
    const result = await t.foo(value);
    expect(result).toBe(value);
  });
});
