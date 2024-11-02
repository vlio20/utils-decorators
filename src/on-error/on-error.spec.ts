import { onError } from './on-error';

describe('onError', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidOnError: any = onError({ func: null });

      class T {
        @nonValidOnError
          boo: string;
      }
    } catch (e) {
      expect('@onError is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify onError called on exception, when as string', () => {
    class T {
      prop = 3;

      @onError<T>({ func: 'onError' })
      foo(x: number): any {
        return this.goo(x);
      }

      goo(x: number): any {
        throw new Error('arr');
      }

      onError(e: Error, args: any[]): void {
        expect(e.message).toBe('arr');
        expect(args).toEqual([1]);
        expect(this.prop).toBe(3);
      }
    }

    const t = new T();
    const spyGoo = jest.spyOn(T.prototype, 'goo');
    const spyAfter = jest.spyOn(T.prototype, 'onError');

    t.foo(1);
    expect(spyGoo).toHaveBeenCalledTimes(1);
    expect(spyGoo).toHaveBeenCalledWith(1);
    expect(spyAfter).toHaveBeenCalledTimes(1);
  });

  it('should verify onError called on exception, when as function', () => {
    const onErrorFunc = jest.fn((e: Error, args: any[]): void => {
      expect(e.message).toBe('arr');
      expect(args).toEqual([1]);
    });

    class T {
      @onError<T>({ func: onErrorFunc })
      foo(x: number): any {
        return this.goo(x);
      }

      goo(x: number): any {
        throw new Error('arr');
      }
    }

    const t = new T();
    const spyGoo = jest.spyOn(T.prototype, 'goo');

    t.foo(1);
    expect(spyGoo).toHaveBeenCalledTimes(1);
    expect(spyGoo).toHaveBeenCalledWith(1);
    expect(onErrorFunc).toHaveBeenCalledTimes(1);
  });

  it('should verify onError called on exception, when function is async', async () => {
    const onErrorFunc = jest.fn(async (e: Error, args: any[]): Promise<void> => {
      expect(e.message).toBe('error');
      expect(args).toEqual([1]);
    });

    class T {
      @onError<T>({ func: onErrorFunc })
      foo(x: number): Promise<void> {
        return Promise.reject(new Error('error'));
      }
    }

    const t = new T();

    await t.foo(1);
    expect(onErrorFunc).toHaveBeenCalledTimes(1);
  });

  it('should verify onError was not called when no error, and the function is async', async () => {
    const onErrorFunc = jest.fn(async (): Promise<void> => {
    });

    class T {
      @onError<T>({ func: onErrorFunc })
      foo(): Promise<void> {
        return Promise.resolve();
      }
    }

    const t = new T();

    await t.foo();
    expect(onErrorFunc).not.toHaveBeenCalled();
  });

  it('should verify onError called on exception, when function is sync', () => {
    const onErrorFunc = jest.fn(async (e: Error, args: any[]): Promise<void> => {
      expect(e.message).toBe('arr');
      expect(args).toEqual([1]);
    });

    class T {
      @onError<T>({ func: onErrorFunc })
      foo(x: number): any {
        throw new Error('arr');
      }
    }

    const t = new T();

    t.foo(1);
    expect(onErrorFunc).toHaveBeenCalledTimes(1);
  });
});
