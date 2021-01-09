import {sleep} from '../common/test-utils';
import {throttleAsync} from './throttle-async';

describe('throttle-async', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonThrottleAsync: any = throttleAsync(50);

      class T {
        @nonThrottleAsync
        boo: string;
      }
    } catch (e) {
      expect('@throttleAsync is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should verify method invocation is throttled 1', async (done) => {
    class T {
      prop = 0;

      @throttleAsync()
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(30);

        return x;
      }
    }

    const t = new T();

    expect(t.prop).toEqual(0);
    t.foo('a').then((res) => {
      expect(res).toEqual('a');
    });
    expect(t.prop).toEqual(1);

    t.foo('b').then((res) => {
      expect(res).toEqual('b');
      done();
    });

    expect(t.prop).toEqual(1);
    await sleep(20);
    expect(t.prop).toEqual(1);

    await sleep(50);
    expect(t.prop).toEqual(2);
  });

  it('should verify method invocation is throttled 2', async (done) => {
    class T {
      prop = 0;

      @throttleAsync(2)
      async foo(): Promise<number> {
        this.prop += 1;
        await sleep(20);

        return this.prop;
      }
    }

    const t = new T();

    t.foo().then((res) => {
      expect(res).toEqual(2);
      expect(t.prop).toEqual(2);
    });

    t.foo().then((res) => {
      expect(res).toEqual(2);
      expect(t.prop).toEqual(2);
      done();
    });
  });

  it('should work also with exceptions', async (done) => {
    class T {
      prop = 0;

      @throttleAsync()
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(30);

        if (this.prop === 1) {
          throw new Error('blarg');
        }

        return x;
      }
    }

    const t = new T();

    t.foo('a')
      .then(() => {
        throw new Error('should get to this point');
      })
      .catch((e: Error) => {
        expect(e.message).toEqual('blarg');
      });

    t.foo('b')
      .then((res) => {
        expect(res).toEqual('b');
        done();
      });
  });

  it('should validate methods invoked in time', async () => {
    class T {
      prop = 0;

      @throttleAsync(2)
      async foo(x: string): Promise<string> {
        this.prop += 1;
        await sleep(20);

        return x;
      }
    }

    const t = new T();

    t.foo('a');
    expect(t.prop).toEqual(1);
    t.foo('b');
    expect(t.prop).toEqual(2);

    await sleep(30);
    t.foo('c');
    expect(t.prop).toEqual(3);

    const val = await t.foo('d');
    expect(t.prop).toEqual(4);
    expect(val).toEqual('d');
  });
});
