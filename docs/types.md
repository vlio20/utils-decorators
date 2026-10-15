# TypeScript types and migration to 3.0

Use TypeScript 5.4 or later with `strict: true` and `experimentalDecorators: true`. This library uses legacy decorators. Function wrappers do not require decorator support.

## Inference comes from the original function

Pass your existing function to a wrapper. Arguments, optional and rest parameters, return values, and explicit `this` requirements are inferred. You do not need to add generic arguments or annotate configuration callbacks.

```ts
import { afterify, memoizify } from 'utils-decorators';

const format = (id: number, prefix = 'item') => `${prefix}-${id}`;
const cached = memoizify(format, {
  keyResolver: (id, prefix) => `${prefix ?? 'item'}:${id}`,
});
const label = cached(42); // string
// @ts-expect-error The original first argument is a number.
cached('42');

const observed = afterify(async (id: number) => ({ id }), {
  wait: true,
  func: ({ args, response }) => {
    args[0].toFixed();    // number
    response.id.toFixed(); // number, after the promise resolves
  },
});
const result = observed(42); // Promise<{ id: number }>
```

Configuration must fit the original function; it cannot widen that function's argument or result types. For example, a string-valued cache cannot cache a number-returning function. Named hooks and key resolvers must name compatible callable members of the receiver.

An explicit receiver on the original function is preserved:

```ts
import { memoizify } from 'utils-decorators';

const cached = memoizify(function (this: { base: number }, id: number) {
  return this.base + id;
});
const service = { base: 10, cached };
service.cached(2); // number
// @ts-expect-error The original function requires a receiver.
cached(2);
```

## Wrapper return values

In this table, `R` is the original function's return type. Every wrapper retains its argument tuple and explicit receiver type.

| Function | Return value |
| --- | --- |
| `afterify` | Original `R`; with `wait: true`, a promise-like result becomes `Promise<Awaited<R>>`. Synchronous results stay synchronous. |
| `beforify` | `R` when `wait` is omitted or false; `Promise<Awaited<R>>` when true; a union when the flag is a runtime boolean. The before hook receives no arguments. |
| `execTimify` | Original synchronous result; `Promise<Awaited<R>>` for promise-like results. The reporter receives the resolved result. |
| `memoizify` | `R`. |
| `memoizeAsyncify` | `Promise<D>` for an original `Promise<D>` function. Caches store resolved `D` values. |
| `cancelPreviousify`, `delegatify`, `multiDispatchify` | `Promise<D>` for an original `Promise<D>` function. Cancellation rejects the previous promise with `CanceledPromise`. |
| `retryfy`, `timeoutify`, `throttleAsyncify` | `Promise<D>` for an original `Promise<D>` function. |
| `debouncify`, `delayfy`, `throttlify` | `void`; the original return value is discarded. |
| `onErrorify` | `Promise<Awaited<R> \| Awaited<H>>`, where `H` is the recovery handler's return type. The source may be synchronous or asynchronous. |
| `rateLimitify` | `R` with a synchronous counter; `Promise<Awaited<R>>` with an asynchronous counter; a union when the counter choice is only known at runtime. |

For `afterify`, `wait` also determines the hook's `response`: `R` for omitted/false, `Awaited<R>` for true, and their union for a runtime boolean. Hook return values are ignored; `wait` waits for the original result, not the after hook.

`onErrorify` handlers receive `(error: unknown, args)` and may return a fallback or throw. Narrow errors before reading properties, for example with `error instanceof Error`.

## Decorators validate the declared method

A legacy decorator cannot change the method signature seen by callers. The decorators therefore validate the original declaration:

| Decorator | Accepted method or property |
| --- | --- |
| `@after`, `@execTime`, `@memoize` | Methods whose hook, reporter, resolver, and cache types are compatible. Synchronous results are preserved. |
| `@before` | Any method with omitted/false `wait`; a promise-returning method when `wait` may be true. |
| `@cancelPrevious`, `@delegate`, `@memoizeAsync`, `@multiDispatch`, `@retry`, `@throttleAsync`, `@timeout` | Promise-returning methods. |
| `@onError` | Promise-returning methods; the handler must return a compatible resolved value, a promise of one, or throw. |
| `@debounce`, `@delay`, `@throttle` | Methods declared to return `void`. Use a function wrapper to schedule a value-returning function and receive `void`. |
| `@rateLimit` | Any compatible method with a synchronous counter; promise-returning methods if an asynchronous counter may be supplied. |
| `@refreshable` | Properties whose type includes the provider's resolved value and initial `undefined`. Providers take no arguments and require no receiver. Include `null` if assigning it to stop refreshing. |
| `@readonly` | Fields and method descriptors. Add TypeScript's `readonly` modifier to a field if assignments should also fail during compilation. |

Decorators that create native promises reject result types requiring extra properties on a custom thenable or promise subclass: those properties cannot be preserved. Declare the method to return an ordinary `Promise<D>` instead.

Both rate-limit counters cannot be supplied together. Retry configuration cannot combine `retries` and `delaysArray`.

### Inline decorator callbacks

TypeScript cannot infer a decorator factory's callback payload backward from the method being decorated. Unannotated payload values therefore use safe `unknown` types. This limitation does not apply to the function wrappers above.

Use a typed hook when the callback needs to operate on specific values. The decorator checks the annotation against the actual method:

```ts
import { after, AfterParams } from 'utils-decorators';

class Service {
  @after({ func: 'record', wait: true })
  async load(id: number): Promise<number> {
    return id;
  }

  record({ args, response }: AfterParams<number, [number]>): void {
    console.log(args[0].toFixed(), response.toFixed());
  }
}
```

The same applies to `ExactTimeReportData<Result, Args>` for reporters. Error callbacks expose `unknown` errors even when their other arguments are annotated. Legacy method decorator signatures cannot distinguish a method from a function-valued accessor; runtime method validation still applies.

## Changes from earlier versions

- Replace explicit configuration factory generics such as `@after<Service, number>(...)` and `@memoize<Service, number>({...})` with inferred calls such as `@after(...)` and `@memoize({...})`. Named members are checked against the decorated class.
- `afterify` and default `beforify` now preserve synchronous results and synchronous throws instead of introducing an async boundary. Use `Promise.resolve().then(() => wrapped(...args))` when an async boundary is required.
- `execTimify` now returns the measured result instead of discarding it. Its decorator preserves the method's result too.
- Update value-returning scheduling methods, incompatible recovery handlers, and synchronous methods using async-only decorators to satisfy the table above.
- `@refreshable` properties must include their initial `undefined` value, for example `users: User[] | undefined | null`.
- `RateLimitConfigs` and `RetryInputConfig` are union type aliases to express mutually exclusive options. Use intersections rather than extending them with an interface.
- Public payloads and error values use `unknown` where their type has not been established. `Method<Result, Args, This>` and `AsyncMethod<Result, Args, This>` support an explicit receiver; their argument default is `unknown[]`. Normal wrapper calls infer these types from the original function.

## Verification

`npm run test:types` compiles the public API regression cases under strict checking. Positive cases verify inference; `@ts-expect-error` cases fail compilation if invalid calls unexpectedly become accepted. Unit tests verify runtime behavior separately. `npm run test:unit` includes type checks and lint; `npm run build` emits both ESM and CommonJS declarations.
