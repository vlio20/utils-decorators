import { perInstance } from './per-instance';

describe('perInstance', () => {
  it('keeps closure state for repeated calls and isolates different instances', () => {
    const create = jest.fn(() => {
      let calls = 0;

      return function (this: { name: string }, amount: number): string {
        calls += amount;

        return `${this.name}:${calls}`;
      };
    });

    class Counter {
      constructor(readonly name: string) {}
      count = sharedCount;
    }
    const sharedCount = perInstance(create);
    const first = new Counter('first');
    const second = new Counter('second');

    expect(first.count(2)).toBe('first:2');
    expect(first.count(3)).toBe('first:5');
    expect(second.count(1)).toBe('second:1');
    expect(first.count(1)).toBe('first:6');
    expect(second.count(2)).toBe('second:3');
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('keeps separate members independent on the same receiver', () => {
    const create = () => {
      let calls = 0;

      return () => ++calls;
    };
    const receiver = { left: perInstance(create), right: perInstance(create) };

    expect(receiver.left()).toBe(1);
    expect(receiver.left()).toBe(2);
    expect(receiver.right()).toBe(1);
    expect(receiver.left()).toBe(3);
  });

  it('supports function receivers with independent state', () => {
    const wrapped = perInstance(() => {
      let calls = 0;

      return () => ++calls;
    });
    const first = () => undefined;
    const second = () => undefined;

    expect(wrapped.call(first)).toBe(1);
    expect(wrapped.call(second)).toBe(1);
    expect(wrapped.call(first)).toBe(2);
  });

  it('keeps detached calls separate from instance calls', () => {
    const wrapped = perInstance(() => {
      let calls = 0;

      return () => ++calls;
    });
    const receiver = { wrapped };

    expect(wrapped()).toBe(1);
    expect(receiver.wrapped()).toBe(1);
    expect(wrapped()).toBe(2);
    expect(receiver.wrapped()).toBe(2);
  });

  it('validates at creation and preserves synchronous errors', () => {
    const error = new Error('invalid configuration');
    expect(() => perInstance(() => { throw error; })).toThrow(error);

    const wrapped = perInstance(() => () => { throw error; });
    expect(() => wrapped()).toThrow(error);
  });

  it('returns the original promise without an extra promise wrapper', async () => {
    const promise = Promise.resolve(42);
    const wrapped = perInstance(() => () => promise);

    expect(wrapped()).toBe(promise);
    await expect(wrapped()).resolves.toBe(42);
  });
});
