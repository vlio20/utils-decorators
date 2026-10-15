import { rateLimit, rateLimitify, RateLimitAsyncCounter, RateLimitConfigs, RateLimitCounter } from '../index';

function typeChecks(counter: RateLimitAsyncCounter, dynamicConfig: RateLimitConfigs<unknown, [number]>) {
  const syncCounter: RateLimitCounter = { inc: () => {}, dec: () => {}, getCount: () => 0 };
  // @ts-expect-error Counters are mutually exclusive.
  rateLimitify((id: number) => id, { allowedCalls: 1, timeSpanMs: 10, rateLimitCounter: syncCounter, rateLimitAsyncCounter: counter });
  // @ts-expect-error Decorator configurations also reject both counter modes.
  rateLimit({ allowedCalls: 1, timeSpanMs: 10, rateLimitCounter: syncCounter, rateLimitAsyncCounter: counter });
  const original = function (this: { base: number }, id: number, suffix?: string, ...flags: boolean[]): number {
    return this.base + id + (suffix?.length ?? 0) + flags.length;
  };
  const sync = rateLimitify(original, { allowedCalls: 1, timeSpanMs: 10, keyResolver: (id) => id.toFixed() });
  const async = rateLimitify(original, { allowedCalls: 1, timeSpanMs: 10, rateLimitAsyncCounter: counter });
  const receiver = { base: 1, sync, async };
  const value: number = receiver.sync(1, 'x', true);
  const promise: Promise<number> = receiver.async(1);
  // @ts-expect-error Async counter always produces a promise.
  const wrong: number = receiver.async(1);
  // @ts-expect-error Invalid argument.
  receiver.sync('x');
  // @ts-expect-error Invalid rest argument.
  receiver.async(1, 'x', 1);
  // @ts-expect-error Receiver required.
  sync(1);
  const maybeAsync = rateLimitify((id: number) => id, dynamicConfig);
  const maybe: number | Promise<number> = maybeAsync(1);
  const optionalAsync: RateLimitConfigs = { allowedCalls: 1, timeSpanMs: 10, rateLimitAsyncCounter: counter };
  const optionalResolver: RateLimitConfigs<unknown, [string]> = { allowedCalls: 1, timeSpanMs: 10, keyResolver: (id) => id };
  class Example {
    field = 1;
    // @ts-expect-error Async counters return native promises without source promise extensions.
    @rateLimit({ allowedCalls: 1, timeSpanMs: 10, rateLimitAsyncCounter: counter })
    extended(): Promise<number> & { extra: string } { return Object.assign(Promise.resolve(this.field), { extra: 'x' }); }
    // @ts-expect-error Optional async counters can also erase promise extensions.
    @rateLimit(optionalAsync)
    optionalExtended(): Promise<number> & { extra: string } { return Object.assign(Promise.resolve(this.field), { extra: 'x' }); }

    @rateLimit({ allowedCalls: 1, timeSpanMs: 10, rateLimitAsyncCounter: undefined })
    explicitlySync(): number { return this.field; }
    // @ts-expect-error Optional async counter can still change the return type.
    @rateLimit(optionalAsync)
    potentiallyAsync(): number { return this.field; }
    @rateLimit(optionalAsync)
    async validAsync(): Promise<number> { return this.field; }
    // @ts-expect-error Optional resolver must accept the method arguments.
    @rateLimit(optionalResolver)
    wrongResolver(id: number): number { return id + this.field; }

    // @ts-expect-error Async counter cannot decorate a synchronous method.
    @rateLimit({ allowedCalls: 1, timeSpanMs: 10, rateLimitAsyncCounter: counter })
    foo(): number { return this.field; }
  }
}

it('checks the public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
