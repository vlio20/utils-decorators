import { before } from './before';
import { beforify } from './beforify';

describe('before', () => {
  it('starts a waiting hook immediately and waits before calling the source', async () => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => { release = resolve; });
    const hook = jest.fn(() => pending);
    const source = jest.fn(() => 42);
    const wrapped = beforify(source, { func: hook, wait: true });

    const result = wrapped();
    expect(hook).toHaveBeenCalledTimes(1);
    expect(source).not.toHaveBeenCalled();
    release();
    await expect(result).resolves.toBe(42);
    expect(source).toHaveBeenCalledTimes(1);
  });

  it('rejects the promise when a waiting hook throws synchronously', async () => {
    const failure = new Error('hook failed');
    const hook = jest.fn(() => { throw failure; });
    const source = jest.fn(() => 42);
    const wrapped = beforify(source, { func: hook, wait: true });

    const result = wrapped();
    expect(hook).toHaveBeenCalledTimes(1);
    await expect(result).rejects.toBe(failure);
    expect(source).not.toHaveBeenCalled();
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      // @ts-expect-error Intentionally invalid input verifies runtime validation.
      const nonValidBefore: any = before({ func: null });

      class T {
        @nonValidBefore
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect('@before is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify before method invocation with the right context when provided as string', () => {
    let counter = 0;

    class T {
      prop!: number;

      before(): void {
        expect(this.prop).toBe(3);
        expect(counter).toBe(0);
        counter += 1;
      }

      @before({
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
    expect(spyGoo).toHaveBeenCalledTimes(1);
    expect(spyGoo).toHaveBeenCalledWith(1);
    expect(spyBefore).toHaveBeenCalledTimes(1);
  });

  it('should verify before method invocation when method is provided', () => {
    let counter = 0;

    const beforeFunc = jest.fn(() => {
      expect(counter).toBe(0);
      counter += 1;
    });

    class T {
      @before({
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
    expect(spyGoo).toHaveBeenCalledTimes(1);
    expect(spyGoo).toHaveBeenCalledWith(1);
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
      @before({
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
      @before({
        func: beforeFunc,
        wait: true,
      })
      async foo(x: number): Promise<void> {
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
      @before({
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

it('preserves synchronous results without waiting for the before hook', () => {
  const hook = jest.fn();
  expect(beforify(() => 42, { func: hook })()).toBe(42);
  expect(hook).toHaveBeenCalledWith();
});
