import { leakyBucket, leakyBucketify, LeakyBucket, LeakyBucketConfigs } from '../index';

function checkTypes(): void {
  const config = { allowedCalls: 10, timeSpanMs: 1000 };
  const bucket = new LeakyBucket(config);
  const wrapped = leakyBucketify(async function (this: { offset: number }, id: number, label?: string, ...flags: boolean[]) {
    return this.offset + id + (label?.length ?? 0) + flags.length;
  }, { bucket });
  const receiver = { offset: 1, wrapped };
  const result: Promise<number> = receiver.wrapped(1, 'item', true);
  // @ts-expect-error Resolved values retain the source type.
  const wrong: Promise<string> = receiver.wrapped(1);
  // @ts-expect-error Required arguments are preserved.
  receiver.wrapped();
  // @ts-expect-error Optional arguments are checked.
  receiver.wrapped(1, false);
  // @ts-expect-error Rest elements are checked.
  receiver.wrapped(1, 'item', 3);
  // @ts-expect-error The receiver is required.
  wrapped(1);
  // @ts-expect-error The source must return a promise.
  leakyBucketify((id: number) => id, config);
  // @ts-expect-error Resolver parameters must match source parameters.
  leakyBucketify(async (id: number) => id, { ...config, signalResolver: (id: string) => undefined });
  // @ts-expect-error A shared bucket owns its own rate configuration.
  leakyBucketify(async () => 1, { bucket, ...config });
  // @ts-expect-error Rate options or a shared bucket are required.
  leakyBucket({});
  // @ts-expect-error A resolver must return a signal or undefined.
  leakyBucket({ ...config, signalResolver: () => 'signal' });

  class Service {
    @leakyBucket(config)
    async valid(id: number): Promise<number> { void this; return id; }

    @leakyBucket({ bucket, signalResolver: (_id: number, signal?: AbortSignal) => signal })
    async cancellable(id: number, _signal?: AbortSignal): Promise<number> { void this; return id; }

    // @ts-expect-error A synchronous method cannot be queued by a decorator.
    @leakyBucket(config)
    invalid(): number { void this; return 1; }

    // @ts-expect-error Native wrapper promises cannot preserve custom promise properties.
    @leakyBucket(config)
    custom(): Promise<number> & { tag: string } {
      void this;
      return Object.assign(Promise.resolve(1), { tag: 'custom' });
    }

    // @ts-expect-error A resolver's arguments must match the decorated method.
    @leakyBucket({ ...config, signalResolver: (_id: string) => undefined })
    incompatible(id: number): Promise<number> { void this; return Promise.resolve(id); }

    // @ts-expect-error Only methods are supported.
    @leakyBucket(config)
    field = 1;
  }

  const union: LeakyBucketConfigs<[number]> | LeakyBucketConfigs<[string]> = {} as any;
  class UnionService {
    // @ts-expect-error Every possible resolver must accept the method arguments.
    @leakyBucket(union)
    run(id: number): Promise<number> { void this; return Promise.resolve(id); }
  }
  const decorated: Promise<number> = new Service().valid(1);
  void UnionService;
  void decorated;
  void result;
  void wrong;
}

it('checks inferred leakyBucket signatures at compile time', () => {
  expect(checkTypes).toBeDefined();
});
