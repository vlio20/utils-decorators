/* eslint-disable class-methods-use-this */
import { rateLimit, rateLimitify, RateLimitAsyncCounter, RateLimitConfigs, RateLimitCounter } from '../index';

function typeChecks(
  counter: RateLimitAsyncCounter,
  dynamicConfig: RateLimitConfigs<unknown, [number]>,
  unionAsyncConfig: { allowedCalls: number; timeSpanMs: number }
    | { allowedCalls: number; timeSpanMs: number; rateLimitAsyncCounter: RateLimitAsyncCounter },
  wrongResolver: { allowedCalls: number; timeSpanMs: number }
    | { allowedCalls: number; timeSpanMs: number; keyResolver: (id: string) => string },
  validResolver: { allowedCalls: number; timeSpanMs: number }
    | { allowedCalls: number; timeSpanMs: number; keyResolver: (id: number) => string },
) {
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

  const sharedOptions = { allowedCalls: 1, timeSpanMs: 10, cache: new Map<string, string>() };
  class UnionConfigurations {
    field = 1;
    // @ts-expect-error An async counter in any union member requires a promise result.
    @rateLimit(unionAsyncConfig)
    sync(): number { return this.field; }
    // @ts-expect-error Async counter branches cannot preserve custom promise properties.
    @rateLimit(unionAsyncConfig)
    extended(): Promise<number> & { extra: string } { return Object.assign(Promise.resolve(this.field), { extra: 'x' }); }
    @rateLimit(unionAsyncConfig)
    async validAsync(): Promise<number> { return this.field; }
    // @ts-expect-error A resolver in any union member must accept the method arguments.
    @rateLimit(wrongResolver)
    wrongResolver(id: number): number { return id + this.field; }
    @rateLimit(validResolver)
    validResolver(id: number): number { return id + this.field; }
    @rateLimit(sharedOptions)
    unrelatedCache(): number { return this.field; }
  }
}

it('checks the public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});

function checkHookArguments(flag: boolean): void {
  rateLimitify((id: number) => id, {
    allowedCalls: 1, timeSpanMs: 1,
    exceedHandler: (id) => { const value: number = id; },
  });
  // @ts-expect-error Exceed handlers must accept the source arguments.
  rateLimitify((id: number) => id, { allowedCalls: 1, timeSpanMs: 1, exceedHandler: (id: string) => {} });

  const rateOptions: RateLimitConfigs<unknown, [string]> = { allowedCalls: 1, timeSpanMs: 1, exceedHandler: (id) => {} };
  const unionRate = flag ? { allowedCalls: 1, timeSpanMs: 1, exceedHandler: (id: string) => {} } : { allowedCalls: 1, timeSpanMs: 1 };
  class Service {
    @rateLimit({ allowedCalls: 1, timeSpanMs: 1, exceedHandler: (id: number) => {} })
    async valid(id: number): Promise<number> { return id; }

    // @ts-expect-error Optional exceed handlers must accept the method arguments.
    @rateLimit(rateOptions)
    async invalidRateOptions(id: number): Promise<number> { return id; }
    // @ts-expect-error Invalid exceed handlers in a union must be rejected.
    @rateLimit(unionRate)
    async invalidRateUnion(id: number): Promise<number> { return id; }
  }
}

it('validates hook argument types', () => {
  expect(checkHookArguments).toBeDefined();
});
