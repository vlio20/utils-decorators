import { cancelPrevious } from './cancel-previous';
import { CanceledPromise } from './canceled-promise';

describe('cancelPrevious', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidCancelPrevious: any = cancelPrevious<T>();

      class T {
        @nonValidCancelPrevious
          boo: string;
      }
    } catch (e) {
      expect('@cancelPrevious is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should cancel prev invocation', (done) => {
    class T {
      @cancelPrevious<T>()
      foo(x: number): Promise<number> {
        return new Promise<number>((resolve) => {
          setTimeout(() => {
            resolve(x);
          }, 10);
        });
      }
    }

    const t = new T();
    let cancelHappened = 0;

    const func = (x: number) => {
      t.foo(x)
        .then((data) => {
          expect(data).toBe(100);
          expect(cancelHappened).toBe(1);
          done();
        })
        .catch((e) => {
          if (e instanceof CanceledPromise) {
            expect(e.message).toBe('canceled');
            cancelHappened += 1;

            return;
          }
          throw new Error('should\'t get here');
        });
    };

    func(10);

    setTimeout(() => {
      func(100);
    }, 5);
  });

  it('should invoke original method id was resolved before second call', (done) => {
    class T {
      @cancelPrevious()
      foo(x: number): Promise<number> {
        return new Promise<number>((resolve) => {
          setTimeout(() => {
            resolve(x);
          }, 10);
        });
      }
    }

    const t = new T();
    let cancelHappened = 0;
    let round = 1;

    const func = (x: number) => {
      t.foo(x)
        .then((data) => {
          if (round === 1) {
            round += 1;
            expect(data).toBe(10);
          } else {
            expect(data).toBe(100);
          }

          expect(cancelHappened).toBe(0);
          done();
        })
        .catch((e) => {
          if (e instanceof CanceledPromise) {
            cancelHappened += 1;
          } else {
            throw new Error('should\'t get here');
          }
        });
    };

    func(10);

    setTimeout(() => {
      func(100);
    }, 15);
  });

  it('should invoke rejection if original method got an error', (done) => {
    class T {
      @cancelPrevious<T>()
      foo(x: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('server error'));
          }, 10);
        });
      }
    }

    const t = new T();

    const func = (x: number) => {
      t.foo(x)
        .then(() => {
          throw new Error('should\'t get here');
        })
        .catch((e) => {
          if (e instanceof CanceledPromise) {
            throw new Error('should\'t get here');
          } else {
            expect(e.message).toBe('server error');
            done();
          }
        });
    };

    func(10);
  });
});
