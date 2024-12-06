import { cancelPrevious } from './cancel-previous';
import { CanceledPromise } from './canceled-promise';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('cancelPrevious', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidCancelPrevious: any = cancelPrevious<T>();

      class T {
        @nonValidCancelPrevious
          boo: string;
      }
    }, Error('@cancelPrevious is applicable only on a methods.'));
  });

  it('should cancel prev invocation', (ctx, done) => {
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
          assert.equal(data, 100);
          assert.equal(cancelHappened, 1);
          done();
        })
        .catch((e) => {
          if (e instanceof CanceledPromise) {
            assert.equal(e.message, 'canceled');
            cancelHappened += 1;

            return;
          }

          throw new Error('shouldn\'t get here');
        });
    };

    func(10);

    setTimeout(() => {
      func(100);
    }, 5);
  });

  it('should invoke original method if it was resolved before second call', (ctx, done) => {
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
            assert.equal(data, 10);
          } else {
            assert.equal(data, 100);
          }

          assert.equal(cancelHappened, 0);
        })
        .catch((e) => {
          if (e instanceof CanceledPromise) {
            cancelHappened += 1;
          } else {
            throw new Error('shouldn\'t get here');
          }
        });
    };

    func(10);

    setTimeout(() => {
      func(100);
      done();
    }, 15);
  });

  it('should invoke rejection if original method got an error', (ctx, done) => {
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
          throw new Error('shouldn\'t get here');
        })
        .catch((e) => {
          if (e instanceof CanceledPromise) {
            throw new Error('shouldn\'t get here');
          } else {
            assert.equal(e.message, 'server error');
            done();
          }
        });
    };

    func(10);
  });
});
