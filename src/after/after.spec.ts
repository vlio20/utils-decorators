import {after} from './after';

describe('after', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidAfter: any = after({func: null});

      class T {
        @nonValidAfter
        boo: string;
      }
    } catch (e) {
      expect('@after is applicable only on a methods.').toBe(e.message);
    }
  });

  it('should verify after method invocation with the right context when provided as string', () => {
    let counter = 0;

    class T {
      prop: number;

      after(): void {
        expect(this.prop).toBe(3);
        expect(counter).toBe(1);
      }

      @after({
        func: 'after'
      })
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(this.prop).toBe(3);
        expect(counter++).toBe(0);

        return;
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

      @after({
        func: afterFunc
      })
      foo(x: number): void {
        return this.goo(x);
      }

      goo(x: number): void {
        expect(counter++).toBe(0);

        return;
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
      expect(counter++).toBe(1);
    });

    class T {

      @after({
        func: afterFunc
      })
      foo(x: number): Promise<void> {
        expect(counter++).toBe(0);

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

      @after({
        func: afterFunc,
        wait: true
      })
      foo(x: number): Promise<void> {
        expect(counter++).toBe(0);

        return new Promise((resolve) => {
          setTimeout(() => {
            expect(counter++).toBe(1);
            resolve();
          }, 0);
        });
      }
    }

    const t = new T();
    t.foo(1);
  });
});
