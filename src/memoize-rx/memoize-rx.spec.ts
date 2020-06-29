import {memoizeRx} from './memoize-rx';
import {RxCache} from './memoize-rx.model';
import {
  Observable,
  of,
  throwError,
  timer
} from 'rxjs';
import {
  take,
} from 'rxjs/operators';

declare const window: any;

describe('memozie-rx', () => {
  it('should verify memoize rx caching original method', (done) => {
    class T {
      prop: number;

      @memoizeRx<T, number>(10)
      foo(x: number, y: number): Observable<number> {
        return this.goo(x, y);
      }

      goo(x: number, y: number): Observable<number> {
        expect(this.prop).toBe(3);

        return of(x + y);
      }
    }

    const t = new T();
    t.prop = 3;
    const spy = jest.spyOn(T.prototype, 'goo');
    let resp1 = null;
    let resp2 = null;
    t.foo(1, 2).subscribe(v => resp1 = v);
    t.foo(1, 2).subscribe(v => resp2 = v);

    setTimeout(() => {
      expect(spy).toHaveBeenCalledWith(1, 2);
      expect(spy).toBeCalledTimes(1);

      let resp01 = null;
      t.foo(1, 3).subscribe(v => resp01 = v);

      setTimeout(() => {
        expect(spy).toHaveBeenCalledWith(1, 3);
        expect(spy).toBeCalledTimes(2);
      }, 0);

      setTimeout(() => {
        let resp3 = null;
        t.foo(1, 2).subscribe(v => resp3 = v);

        setTimeout(() => {
          expect(spy).toHaveBeenCalledWith(1, 2);

          expect(spy).toBeCalledTimes(3);

          expect(resp1).toBe(3);
          expect(resp2).toBe(3);
          expect(resp3).toBe(3);
          expect(resp01).toBe(4);
          done();
        }, 0);
      }, 20);
    }, 0);
  });

  it('should emit to old and new subscribers', done => {
    class T {
      @memoizeRx<T, number>({})
      foo(): Observable<number> {
        return timer(10, 10).pipe(take(3));
      }
    }

    const t = new T();

    const first = [];
    const second = [];

    t.foo().subscribe(v => first.push(v));

    setTimeout(()=>{
      expect(first).toEqual([0]);
      t.foo().subscribe(v => second.push(v));
    }, 15);

    setTimeout(()=>{
      expect(first).toEqual([0,1,2]);
      expect(second).toEqual([0,1,2]);
      done();
    }, 40);
  });

  it('should verify memoize key foo', (done) => {
    const mapper = jest.fn((x: string, y: string) => `${x}_${y}`);

    class T {
      @memoizeRx<T, string>({expirationTimeMs: 10, keyResolver: mapper})
      fooWithMapper(x: string, y: string): Observable<string> {
        return this.goo(x, y);
      }

      goo(x: string, y: string): Observable<string> {
        return of(x + y);
      }
    }

    const t = new T();
    const spyFooWithMapper = jest.spyOn(T.prototype, 'goo');

    t.fooWithMapper('x', 'y').subscribe();
    t.fooWithMapper('x', 'y').subscribe();

    setTimeout(() => {
      expect(mapper.mock.calls.length).toBe(2);
      expect(spyFooWithMapper).toHaveBeenCalledTimes(1);
      expect(spyFooWithMapper).toHaveBeenCalledWith('x', 'y');
      done();
    }, 0);
  });

  it('should verify memoize key foo as string - target method', (done) => {
    class T {
      foo(x: string, y: string): string {
        return `${x}_${y}`;
      }

      @memoizeRx<T, string>({expirationTimeMs: 10, keyResolver: 'foo'})
      fooWithMapper(x: string, y: string): Observable<string> {
        return this.goo(x, y);
      }

      goo(x: string, y: string): Observable<string> {
        return of(x + y);
      }
    }

    const t = new T();
    const spyFooWithMapper = jest.spyOn(T.prototype, 'goo');
    const mapper = jest.spyOn(T.prototype, 'foo');

    t.fooWithMapper('x', 'y').subscribe();
    t.fooWithMapper('x', 'y').subscribe();

    setTimeout(() => {
      expect(mapper).toHaveBeenCalledTimes(2);
      expect(spyFooWithMapper).toHaveBeenCalledTimes(1);
      expect(spyFooWithMapper).toHaveBeenCalledWith('x', 'y');
      expect(mapper).toHaveBeenCalledWith('x', 'y');
      done();
    }, 0);
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidmemoizeRx: any = memoizeRx<T, string>(50);

      class T {
        @nonValidmemoizeRx
        boo: string;
      }
    } catch (e) {
      expect('@memoizeRx is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should use provided cache', (done) => {
    const cache = new Map<string, Observable<number>>();

    class T {
      @memoizeRx<T, number>({expirationTimeMs: 30, cache})
      foo(): Observable<number> {
        return this.goo();
      }

      goo(): Observable<number> {
        return of(1);
      }
    }

    const spy = jest.spyOn(T.prototype, 'goo');

    const t = new T();
    t.foo().subscribe();

    setTimeout(() => {
      t.foo().subscribe();
      setTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(1);

        cache.delete('[]');
        t.foo().subscribe();

        setTimeout(() => {
          expect(spy).toHaveBeenCalledTimes(2);
          done();
        }, 0);
      }, 0);
    }, 10);
  });

  it('should use different scope to different usages', () => {
    class T {
      @memoizeRx<T, number>(20)
      foo(): Observable<number> {
        return of(1);
      }

      @memoizeRx<T, number>(20)
      goo(): Observable<number> {
        return of(2);
      }
    }

    const t = new T();
    let one = null;
    let two = null;
    t.foo().subscribe(v => one = v);
    t.goo().subscribe(v => two = v);

    expect(one).toBe(1);
    expect(two).toBe(2);
  });

  it('should verify defaults', () => {
    class T {
      @memoizeRx<T, number>({})
      foo(): Observable<number> {
        return of(1);
      }
    }

    const t = new T();
    spyOn(window, 'setTimeout');
    t.foo().subscribe();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 60000);
  });

  it('should throw exception when original method is broken', (done) => {
    const map = new Map<string, Observable<number>>();

    const cache: RxCache<number> = {
      delete: (p1: string) => map.delete(p1),
      get: (p1: string) => map.get(p1),
      has: (p1: string) => map.has(p1),
      set: (p1: string, p2: Observable<number>) => map.set(p1, p2),
    };

    class T {
      @memoizeRx<T, number>({
        expirationTimeMs: 30,
        cache,
      })
      foo(): Observable<number> {
        return throwError(new Error('error'));
      }
    }

    const t = new T();
    let e = null;
    t.foo().subscribe({ error: err => e = err})

    setTimeout(() => {
      expect(e.message).toBe('error');
      done()
    }, 0)
  });
});
