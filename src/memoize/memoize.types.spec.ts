import { memoizify, memoize, MemoizeConfig, AsyncCache } from '../index';

function typeChecks(asyncCache: AsyncCache<number>) {
  const optionalWrongCache: MemoizeConfig<unknown, string> = { cache: new Map<string, string>() };
  const optionalWrongResolver: MemoizeConfig<unknown, number, [string]> = { keyResolver: (id) => id };
  class CacheValidation {
    field = 1;
    // @ts-expect-error Synchronous memoize cannot use an asynchronous cache.
    @memoize({ cache: asyncCache })
    sync(): number { return this.field; }
    // @ts-expect-error Optional cache properties must still be checked.
    @memoize(optionalWrongCache)
    wrongCache(): number { return this.field; }
    // @ts-expect-error Optional resolver properties must still be checked.
    @memoize(optionalWrongResolver)
    wrongResolver(id: number): number { return id + this.field; }
    @memoize({ cache: new Map<string, number>() })
    valid(): number { return this.field; }
  }

  const identity = memoizify(<T>(value: T): T => value);
  const literal: 'value' = identity('value' as const);
  const wrapped = memoizify(function (this: { base: number }, id: number, suffix?: string, ...flags: boolean[]): number {
    return this.base + id + (suffix?.length ?? 0) + flags.length;
  });
  const receiver = { base: 1, wrapped };
  const result: number = receiver.wrapped(1, 'x', true);
  receiver.wrapped(1);
  // @ts-expect-error Wrong first argument.
  receiver.wrapped('wrong');
  // @ts-expect-error Wrong rest argument.
  receiver.wrapped(1, 'x', 2);
  // @ts-expect-error Receiver is required.
  wrapped(1);
  // @ts-expect-error Return type is preserved.
  const wrong: string = result;
  memoizify((id: number) => id, {
    keyResolver: (id) => id.toFixed(),
  });
  // @ts-expect-error Cache values must match the original return type.
  memoizify((id: number) => id, {
    cache: new Map<string, string>(),
  });
  // @ts-expect-error Key resolver must accept the original arguments.
  memoizify((id: number) => id, {
    keyResolver: (id: string) => id,
  });
  class InvalidResolvers {
    field = 1;
    key(id: string): string { return id + this.field; }
    // @ts-expect-error Named resolver cannot accept the decorated method's arguments.
    @memoize({ keyResolver: 'key' })
    foo(id: number): number { return id + this.field; }
    // @ts-expect-error Resolver callback cannot accept the decorated method's arguments.
    @memoize({ keyResolver: (id: string) => id })
    goo(id: number): number { return id + this.field; }
    // @ts-expect-error Named resolver must be callable.
    @memoize({ keyResolver: 'field' })
    boo(id: number): number { return id + this.field; }
  }

}

it('checks the public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
