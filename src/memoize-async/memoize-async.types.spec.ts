import { memoizeAsyncify, memoizeAsync, AsyncMemoizeConfig, AsyncCache } from '../index';

function typeChecks(asyncCache: AsyncCache<number>) {
  const optionalWrongCache: AsyncMemoizeConfig<unknown, string> = { cache: new Map<string, string>() };
  const optionalWrongResolver: AsyncMemoizeConfig<unknown, number, [string]> = { keyResolver: (id) => id };
  class CacheValidation {
    field = 1;
    // @ts-expect-error Memoization returns native promises without source promise extensions.
    @memoizeAsync()
    extended(): Promise<number> & { extra: string } { return Object.assign(Promise.resolve(this.field), { extra: 'x' }); }
    // @ts-expect-error The configured decorator must also reject extended promise signatures.
    @memoizeAsync({ expirationTimeMs: 10 })
    configuredExtended(): Promise<number> & { extra: string } { return Object.assign(Promise.resolve(this.field), { extra: 'x' }); }
    // @ts-expect-error Numeric configuration must also reject extended promise signatures.
    @memoizeAsync(10)
    numericExtended(): Promise<number> & { extra: string } { return Object.assign(Promise.resolve(this.field), { extra: 'x' }); }

    @memoizeAsync({ cache: asyncCache })
    async valid(): Promise<number> { return this.field; }
    // @ts-expect-error Optional cache properties must still be checked.
    @memoizeAsync(optionalWrongCache)
    async wrongCache(): Promise<number> { return this.field; }
    // @ts-expect-error Optional resolver properties must still be checked.
    @memoizeAsync(optionalWrongResolver)
    async wrongResolver(id: number): Promise<number> { return id + this.field; }
  }

  const wrapped = memoizeAsyncify(async function (this: { base: number }, id: number, suffix?: string, ...flags: boolean[]): Promise<number> {
    return this.base + id + (suffix?.length ?? 0) + flags.length;
  });
  const receiver = { base: 1, wrapped };
  const result: Promise<number> = receiver.wrapped(1, 'x', true);
  receiver.wrapped(1);
  // @ts-expect-error Wrong first argument.
  receiver.wrapped('wrong');
  // @ts-expect-error Wrong rest argument.
  receiver.wrapped(1, 'x', 2);
  // @ts-expect-error Receiver is required.
  wrapped(1);
  // @ts-expect-error Return type is preserved.
  const wrong: string = result;
  class Example {
    field = 1;
    // @ts-expect-error Async decorators cannot change a synchronous signature.
    @memoizeAsync()
    foo(): number { return this.field; }
  }
  memoizeAsyncify(async (id: number) => id, {
    keyResolver: (id) => id.toFixed(),
  });
  // @ts-expect-error Cache values must match the original return type.
  memoizeAsyncify(async (id: number) => id, {
    cache: new Map<string, string>(),
  });
  // @ts-expect-error Key resolver must accept the original arguments.
  memoizeAsyncify(async (id: number) => id, {
    keyResolver: (id: string) => id,
  });
  class InvalidResolvers {
    field = 1;
    key(id: string): string { return id + this.field; }
    // @ts-expect-error Named resolver cannot accept the decorated method's arguments.
    @memoizeAsync({ keyResolver: 'key' })
    foo(id: number): Promise<number> { return Promise.resolve(id); }
    // @ts-expect-error Resolver callback cannot accept the decorated method's arguments.
    @memoizeAsync({ keyResolver: (id: string) => id })
    goo(id: number): Promise<number> { return Promise.resolve(id); }
    // @ts-expect-error Named resolver must be callable.
    @memoizeAsync({ keyResolver: 'field' })
    boo(id: number): Promise<number> { return Promise.resolve(id); }
  }

}

it('checks the public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
