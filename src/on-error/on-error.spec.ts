import {onError} from './on-error';

describe('onError', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidOnError: any = onError({func: null});

      class T {
        @nonValidOnError
        boo: string;
      }
    } catch (e) {
      expect('@onError is applicable only on a methods.').toBe(e.message);
    }
  });

  it('should verify onError called on exception, when as string', () => {
    class T {
      prop: number = 3;

      @onError<T>({func: 'onError'})
      foo(x: number): any {
        return this.goo(x);
      }

      goo(x: number): any {
        throw Error('arr');
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
    expect(spyGoo).toBeCalledTimes(1);
    expect(spyGoo).toBeCalledWith(1);
    expect(spyAfter).toBeCalledTimes(1);
  });

  it('should verify onError called on exception, when as function', () => {
    const onErrorFunc = jest.fn((e: Error, args: any[]): void => {
      expect(e.message).toBe('arr');
      expect(args).toEqual([1]);
    });

    class T {

      @onError<T>({func: onErrorFunc})
      foo(x: number): any {
        return this.goo(x);
      }

      goo(x: number): any {
        throw Error('arr');
      }
    }

    const t = new T();
    const spyGoo = jest.spyOn(T.prototype, 'goo');

    t.foo(1);
    expect(spyGoo).toBeCalledTimes(1);
    expect(spyGoo).toBeCalledWith(1);
    expect(onErrorFunc).toBeCalledTimes(1);
  });
});
