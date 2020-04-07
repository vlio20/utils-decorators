import {delegate} from './delegate';
import {sleep} from '../common/test-utils';

describe('delegate', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidDelegate: any = delegate();

      class T {
        @nonValidDelegate
        boo: string;
      }
    } catch (e) {
      expect('@delegate is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should delegate method with same key invocation', async () => {
    let counter = 0;

    class T {
      @delegate()
      async foo(): Promise<number> {
        counter += 1;
        await sleep(20);

        return Promise.resolve(1);
      }
    }

    const t = new T();
    t.foo();
    t.foo();

    const res = await Promise.all([t.foo(), t.foo()]);
    expect(res).toEqual([1, 1]);
    expect(counter).toEqual(1);
  });

  it('should delegate method with same key invocation - default key serialization', async () => {
    let counter = 0;

    class T {
      @delegate()
      async foo(x: string): Promise<string> {
        counter += 1;
        await sleep(20);

        return Promise.resolve(x);
      }
    }

    const t = new T();

    const res = await Promise.all([t.foo('a'), t.foo('a'), t.foo('b')]);
    expect(res).toEqual(['a', 'a', 'b']);
    expect(counter).toEqual(2);
  });

  it('should delegate method with same key invocation - custom serialization', async () => {
    let counter = 0;

    class T {
      @delegate((a: number, b: number) => `${a}_${b}`)
      async foo(a: number, b: number): Promise<number> {
        counter += 1;
        await sleep(20);

        return Promise.resolve(a + b);
      }
    }

    const t = new T();

    const res = await Promise.all([t.foo(1, 1), t.foo(2, 1), t.foo(1, 1)]);
    expect(res).toEqual([2, 3, 2]);
    expect(counter).toEqual(2);
  });
});
