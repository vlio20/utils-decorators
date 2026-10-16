import { leakyBucket, leakyBucketify, LeakyBucket } from '../index';

describe('leaky-bucket', () => {
  const config = { allowedCalls: 10, timeSpanMs: 1000 };

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it.each([0, -1, NaN, Infinity, -Infinity])('rejects invalid timeSpanMs %s', (timeSpanMs) => {
    expect(() => new LeakyBucket({ ...config, timeSpanMs })).toThrow('timeSpanMs must be a positive finite number.');
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid allowedCalls %s', (allowedCalls) => {
    expect(() => new LeakyBucket({ ...config, allowedCalls })).toThrow('allowedCalls must be a positive safe integer.');
  });

  it.each([-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid maxQueueSize %s', (maxQueueSize) => {
    expect(() => new LeakyBucket({ ...config, maxQueueSize })).toThrow('maxQueueSize must be a non-negative safe integer.');
  });

  it('rejects intervals that underflow to zero', () => {
    expect(() => new LeakyBucket({ timeSpanMs: Number.MIN_VALUE, allowedCalls: 2 }))
      .toThrow('timeSpanMs / allowedCalls must be greater than zero.');
  });

  it('validates the configuration when creating a decorator', () => {
    expect(() => {
      class Service {
        @leakyBucket({ ...config, allowedCalls: 0 })
        async run(): Promise<void> { void this; }
      }
      return Service;
    }).toThrow(RangeError);
  });

  it('rejects fields and missing method descriptors', () => {
    const decorate: any = leakyBucket(config);
    expect(() => decorate({}, 'field')).toThrow('@leakyBucket is applicable only on a method.');
    expect(() => decorate({}, 'field', {})).toThrow('@leakyBucket is applicable only on a method.');
  });

  it('starts immediately and spaces FIFO calls independently of promise completion', async () => {
    const starts: Array<[number, number]> = [];
    let finishFirst!: (value: number) => void;
    const run = leakyBucketify((id: number) => {
      starts.push([id, performance.now()]);
      return id === 1 ? new Promise<number>(resolve => { finishFirst = resolve; }) : Promise.resolve(id);
    }, config);
    const first = run(1);
    const second = run(2);
    const third = run(3);
    expect(starts).toEqual([[1, 0]]);
    await jest.advanceTimersByTimeAsync(99);
    expect(starts).toEqual([[1, 0]]);
    await jest.advanceTimersByTimeAsync(1);
    expect(await second).toBe(2);
    await jest.advanceTimersByTimeAsync(100);
    expect(await third).toBe(3);
    expect(starts).toEqual([[1, 0], [2, 100], [3, 200]]);
    finishFirst(1);
    expect(await first).toBe(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  it('starts immediately after idle time without accumulating burst capacity', async () => {
    const task = jest.fn(async () => performance.now());
    const run = leakyBucketify(task, config);
    expect(await run()).toBe(0);
    jest.advanceTimersByTime(1000);
    const second = run();
    const third = run();
    expect(task).toHaveBeenCalledTimes(2);
    expect(await second).toBe(1000);
    await jest.advanceTimersByTimeAsync(100);
    expect(await third).toBe(1100);
  });

  it('rounds fractional waits up and rechecks timers that fire early', async () => {
    const now = jest.spyOn(performance, 'now').mockReturnValue(0);
    const run = leakyBucketify(async () => performance.now(), { allowedCalls: 3, timeSpanMs: 10 });
    expect(await run()).toBe(0);
    const second = run();
    jest.advanceTimersByTime(3);
    now.mockReturnValue(2);
    jest.advanceTimersByTime(1);
    expect(jest.getTimerCount()).toBe(1);
    now.mockReturnValue(4);
    jest.advanceTimersByTime(2);
    expect(await second).toBe(4);
  });

  it('splits waits above the platform timer limit without starting early', async () => {
    const task = jest.fn(async () => 1);
    const run = leakyBucketify(task, { allowedCalls: 1, timeSpanMs: 2147483648 });
    await run();
    const next = run();
    jest.advanceTimersByTime(2147483647);
    expect(task).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(1);
    await jest.advanceTimersByTimeAsync(1);
    expect(await next).toBe(1);
    expect(task).toHaveBeenCalledTimes(2);
  });

  it('bounds only waiting calls and frees capacity on dispatch', async () => {
    const run = leakyBucketify(async (id: number) => id, { ...config, maxQueueSize: 1 });
    expect(await run(1)).toBe(1);
    const second = run(2);
    await expect(run(3)).rejects.toThrow('Leaky bucket queue is full.');
    await jest.advanceTimersByTimeAsync(100);
    expect(await second).toBe(2);
    const fourth = run(4);
    await jest.advanceTimersByTimeAsync(100);
    expect(await fourth).toBe(4);
  });

  it('rejects overflow when queued work is ready but its timer has been delayed', async () => {
    const now = jest.spyOn(performance, 'now').mockReturnValue(0);
    const task = jest.fn(async (id: number) => id);
    const run = leakyBucketify(task, { ...config, maxQueueSize: 1 });
    await run(1);
    const queued = run(2);
    now.mockReturnValue(100);
    await expect(run(3)).rejects.toThrow('Leaky bucket queue is full.');
    expect(task.mock.calls).toEqual([[1]]);
    await jest.advanceTimersByTimeAsync(100);
    expect(await queued).toBe(2);
    expect(task.mock.calls).toEqual([[1], [2]]);
  });

  it('allows zero queue capacity for immediately available calls', async () => {
    const bucket = new LeakyBucket({ ...config, maxQueueSize: 0 });
    expect(await bucket.exec(async () => 1)).toBe(1);
    await expect(bucket.exec(async () => 2)).rejects.toThrow('Leaky bucket queue is full.');
    jest.advanceTimersByTime(100);
    expect(await bucket.exec(async () => 3)).toBe(3);
  });

  it('defaults to at most 1000 waiting calls', async () => {
    const bucket = new LeakyBucket(config);
    const calls = Array.from({ length: 1001 }, (_, id) => bucket.exec(async () => id));
    await expect(bucket.exec(async () => -1)).rejects.toThrow('Leaky bucket queue is full.');
    await jest.runAllTimersAsync();
    expect(await Promise.all(calls)).toEqual(Array.from({ length: 1001 }, (_, id) => id));
  });

  it('keeps source rejections and synchronous throws local to their calls', async () => {
    const failure = new Error('source failed');
    const run = leakyBucketify((id: number): Promise<number> => {
      if (id === 1) {
        throw failure;
      }
      return id === 2 ? Promise.reject(failure) : Promise.resolve(id);
    }, config);
    await expect(run(1)).rejects.toBe(failure);
    const second = expect(run(2)).rejects.toBe(failure);
    const third = run(3);
    await jest.runAllTimersAsync();
    await second;
    expect(await third).toBe(3);
  });

  it('rejects already aborted calls without consuming queue or pacing capacity', async () => {
    const controller = new AbortController();
    const reason = new Error('cancelled');
    controller.abort(reason);
    const task = jest.fn(async () => 1);
    const bucket = new LeakyBucket({ ...config, maxQueueSize: 0 });
    await expect(bucket.exec(task, controller.signal)).rejects.toBe(reason);
    expect(task).not.toHaveBeenCalled();
    expect(await bucket.exec(task)).toBe(1);
  });

  it('cancels queued calls, frees capacity, and preserves FIFO order', async () => {
    const task = jest.fn(async (id: number, _signal?: AbortSignal) => id);
    const run = leakyBucketify(task, {
      ...config,
      maxQueueSize: 2,
      signalResolver: (_id: number, signal?: AbortSignal) => signal,
    });
    await run(1);
    const controller = new AbortController();
    const remove = jest.spyOn(controller.signal, 'removeEventListener');
    const cancelled = expect(run(2, controller.signal)).rejects.toBe('skip');
    const third = run(3);
    controller.abort('skip');
    await cancelled;
    expect(jest.getTimerCount()).toBe(1);
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    const fourth = run(4);
    expect(jest.getTimerCount()).toBe(1);
    await jest.runAllTimersAsync();
    expect(await Promise.all([third, fourth])).toEqual([3, 4]);
    expect(task.mock.calls.map(([id]) => id)).toEqual([1, 3, 4]);
  });

  it('clears the last cancelled call timer without resetting pacing', async () => {
    const bucket = new LeakyBucket(config);
    await bucket.exec(async () => 1);
    const controller = new AbortController();
    const cancelled = expect(bucket.exec(async () => 2, controller.signal)).rejects.toBe('stop');
    expect(jest.getTimerCount()).toBe(1);
    controller.abort('stop');
    await cancelled;
    expect(jest.getTimerCount()).toBe(0);
    const task = jest.fn(async () => 3);
    const third = bucket.exec(task);
    expect(task).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(100);
    expect(await third).toBe(3);
  });

  it('removes abort listeners before dispatch and leaves active calls to the source', async () => {
    const bucket = new LeakyBucket(config);
    const controller = new AbortController();
    const remove = jest.spyOn(controller.signal, 'removeEventListener');
    let finish!: (value: number) => void;
    const pending = bucket.exec(() => new Promise<number>(resolve => { finish = resolve; }), controller.signal);
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
    controller.abort();
    finish(42);
    expect(await pending).toBe(42);
  });

  it('binds signal resolvers to the receiver and converts resolver errors to rejections', async () => {
    const failure = new Error('resolver failed');
    const controller = new AbortController();
    controller.abort(failure);
    const task = jest.fn(async function (this: { signal: AbortSignal }, _id: number) { return this.signal; });
    const wrapped = leakyBucketify(task, {
      ...config,
      signalResolver: function (this: { signal: AbortSignal }, id: number) {
        if (id === 0) {
          throw failure;
        }
        return this.signal;
      },
    });
    const receiver = { signal: controller.signal, wrapped };
    await expect(receiver.wrapped(0)).rejects.toBe(failure);
    await expect(receiver.wrapped(1)).rejects.toBe(failure);
    expect(task).not.toHaveBeenCalled();
  });

  it('isolates decorator budgets per method and instance and preserves receivers and arguments', async () => {
    class Service {
      constructor(private readonly name: string) {}

      @leakyBucket(config)
      async run(id: number, label?: string): Promise<string> { return this.name + id + label; }

      @leakyBucket(config)
      async other(): Promise<string> { return this.name; }
    }
    const first = new Service('a');
    const second = new Service('b');
    const calls = [first.run(1, 'x'), second.run(2, 'y'), first.other()];
    expect(await Promise.all(calls)).toEqual(['a1x', 'b2y', 'a']);
    expect(jest.getTimerCount()).toBe(0);
    const queued = first.run(3, 'z');
    await jest.advanceTimersByTimeAsync(100);
    expect(await queued).toBe('a3z');
  });

  it('shares explicit buckets across decorated methods, instances, and wrappers', async () => {
    const bucket = new LeakyBucket(config);
    const starts: number[] = [];
    class Service {
      @leakyBucket({ bucket })
      async run(): Promise<void> { void this; starts.push(performance.now()); }

      @leakyBucket({ bucket })
      async other(): Promise<void> { void this; starts.push(performance.now()); }
    }
    const wrapped = leakyBucketify(async () => { starts.push(performance.now()); }, { bucket });
    const calls = [new Service().run(), new Service().run(), new Service().other(), wrapped()];
    expect(starts).toEqual([0]);
    await jest.runAllTimersAsync();
    await Promise.all(calls);
    expect(starts).toEqual([0, 100, 200, 300]);
  });

  it('shares a function wrapper across receivers without losing arguments or context', async () => {
    const wrapped = leakyBucketify(async function (this: { name: string }, ...ids: number[]) {
      return this.name + ids.join(',');
    }, config);
    const a = { name: 'a', wrapped };
    const b = { name: 'b', wrapped };
    const first = a.wrapped(1, 2);
    const second = b.wrapped(3, 4);
    await jest.runAllTimersAsync();
    expect(await Promise.all([first, second])).toEqual(['a1,2', 'b3,4']);
  });

  it('drains large queues without recursive stack growth when synchronous work exceeds the interval', async () => {
    let clock = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => clock);
    const bucket = new LeakyBucket({ timeSpanMs: 1, allowedCalls: 10, maxQueueSize: 20000 });
    await bucket.exec(async () => 0);
    const calls = Array.from({ length: 20000 }, (_, id) => bucket.exec(() => {
      clock += 1;
      return Promise.resolve(id);
    }));
    clock = 1;
    jest.advanceTimersByTime(1);
    expect(await Promise.all(calls)).toEqual(Array.from({ length: 20000 }, (_, id) => id));
    expect(jest.getTimerCount()).toBe(0);
  });

  it('queues reentrant submissions behind existing work without recursive dispatch', async () => {
    let clock = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => clock);
    const bucket = new LeakyBucket(config);
    const starts: number[] = [];
    const nested: Array<Promise<void>> = [];
    const run = (id: number): Promise<void> => bucket.exec(() => {
      starts.push(id);
      clock += 100;
      if (id < 10000) {
        nested.push(run(id + 1));
      }
      return Promise.resolve();
    });
    await run(0);
    await Promise.all(nested);
    expect(starts).toEqual(Array.from({ length: 10001 }, (_, id) => id));
  });
});
