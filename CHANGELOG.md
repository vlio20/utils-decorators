# Change Log
All notable changes to this project will be documented in this file.

## [3.0.1] - 2026-10-28

### Fixed
- Allow `throttleAsync`, `throttle`, `debounce`, and `delay` to decorate private and protected methods while preserving method type validation; closes [#197](https://github.com/vlio20/utils-decorators/issues/197).

## [3.0.0] - 2026-10-16

### Enchantments
- Add `leakyBucket`, `leakyBucketify`, and shared `LeakyBucket` limiters for steady call pacing, bounded FIFO queues, and cancellation of waiting calls with `AbortSignal`; closes [#159](https://github.com/vlio20/utils-decorators/issues/159).
- Provide original call arguments to `retry` / `retryfy` hooks as `onRetry(error, retryIndex, args)` and to `rateLimit` / `rateLimitify` handlers as `exceedHandler(...args)`, with matching callback validation; part of [#172](https://github.com/vlio20/utils-decorators/issues/172).
- Modernize the documentation UI with searchable navigation, light and dark themes, mobile navigation, copyable examples, and decorator/function tabs for all 18 utilities. Add installation, TypeScript setup, and migration to 3.0.0 guides; remove the legacy documentation; closes [#182](https://github.com/vlio20/utils-decorators/issues/182).
- Update dependencies [181](https://github.com/vlio20/utils-decorators/pull/181) closes [#179](https://github.com/vlio20/utils-decorators/issues/179)
- Replace Babel test compilation with TypeScript and V8 coverage, removing direct Babel dependencies; closes [#185](https://github.com/vlio20/utils-decorators/issues/185).

### Fixed
- Forward original arguments to `before` / `beforify` hooks as `func(...args)`, including named hooks and waiting calls; closes [#172](https://github.com/vlio20/utils-decorators/issues/172).
- Isolate stateful decorators per class instance, including cancellation, pending work, default caches, throttling, and rate-limit counters; start `refreshable` independently on each instance’s first property read; closes [#188](https://github.com/vlio20/utils-decorators/issues/188).
- Strengthen inferred types across all decorators and function wrappers: preserve argument tuples and receivers, validate callbacks, keys, caches, and exclusive options, and report accurate synchronous, asynchronous, and recovery results; closes [#183](https://github.com/vlio20/utils-decorators/issues/183).
- Support TypeScript legacy field decorators in `@readonly` and preserve validation errors when method decorators are applied to fields; closes [#185](https://github.com/vlio20/utils-decorators/issues/185).
- Fix argument forwarding in `@multiDispatch` and `multiDispatchify` [181](https://github.com/vlio20/utils-decorators/pull/181) closes [#184](https://github.com/vlio20/utils-decorators/issues/184)

### Changed
- Replace real-time waits in timer-based tests with Jest fake timers, enable per-test mutation coverage and incremental results, and cache compatible mutation results in CI while retaining the 95% score threshold. Add `npm run test:mutation:full` to force a full run; addresses [#186](https://github.com/vlio20/utils-decorators/issues/186). Baseline comparisons and periodic full mutation runs remain outstanding.
- Before and rate-limit hooks now receive the original arguments; retry hooks receive the argument tuple as a third parameter. Existing callbacks may ignore the added arguments. Code inspecting callback argument counts will observe the new payloads.
- Preserve synchronous results in `afterify` and default `beforify`, and return measured results from `execTimify`. Reject decorator declarations whose return types cannot be preserved, including value-returning scheduling methods and custom promise result properties.
- Use safe `unknown` payload defaults and inferred configuration factories. Add strict public API type regressions and concise [TypeScript documentation](https://vlio20.github.io/utils-decorators/#typescript).

### Breaking changes
- Stateful decorators now isolate cancellation, pending work, default caches, throttle queues, and default rate-limit counters per instance. Applications relying on accidental cross-instance sharing must opt into a shared function wrapper or supply a shared custom cache/counter.
- `@refreshable` starts loading and refreshing on each instance’s first property read, rather than at class definition. Values and stop assignments are isolated per instance; reading initially returns `undefined`.
- Stricter public types infer argument tuples, receivers, callbacks, keys, and cache values, and reject incompatible method returns and mutually exclusive options. Payload defaults are `unknown`; update explicit generics and annotations as described in the [migration guide](https://vlio20.github.io/utils-decorators/#migration).
- `afterify` and default `beforify` preserve synchronous results and throws; `execTimify` returns the measured result. Adapt callers that previously expected a promise or no result.
- Node.js now requires `^22.18.0 || >=24.11.0`. TypeScript consumers should use TypeScript 5.4+ with strict checking and legacy decorators enabled.

## [2.10.0] - 2024-10-02

### Enchantments
- Update dependencies [169](https://github.com/vlio20/utils-decorators/pull/169) closes [#170](https://github.com/vlio20/utils-decorators/issues/170)

## [2.0.9] - 2024-08-11

### Fixed
- Fix delegate default serialization with many args [165](https://github.com/vlio20/utils-decorators/pull/165) closes [#166](https://github.com/vlio20/utils-decorators/issues/166) - Kudos to [masoud-msk](https://github.com/masoud-msk) for reporting and fixing.

## [2.0.8] - 2023-12-23

### Enchantments
- Update dependencies [164](https://github.com/vlio20/utils-decorators/commit/164)

## [2.0.7] - 2023-09-26

### Fixed
- Fixing missing await on memoizeAsync [161](https://github.com/vlio20/utils-decorators/pull/160) closes [#161](https://github.com/vlio20/utils-decorators/issues/161) - Kudos to [maormoshe](https://github.com/maormoshe) for reporting and fixing.

## [2.0.6] - 2023-05-12

### Enchantments
- Update dependencies [157](https://github.com/vlio20/utils-decorators/commit/157) closes [#156](https://github.com/vlio20/utils-decorators/issues/156)

## [2.0.5] - 2022-07-17

### Enchantments
- Update dependencies [5817e55](https://github.com/vlio20/utils-decorators/commit/5817e55) closes [#148](https://github.com/vlio20/utils-decorators/issues/148)

### Fixed
- Debounce should support multi instances [709310d](https://github.com/vlio20/utils-decorators/commit/709310d) closes [#145](https://github.com/vlio20/utils-decorators/issues/145) - Kudos to [gongpeione](https://github.com/gongpeione) for reporting.
 
## [2.0.4] - 2022-05-13

### Fixed 
- `timeout`: error doesn't catch correctly [142](https://github.com/vlio20/utils-decorators/pull/142) closes [#143](https://github.com/vlio20/utils-decorators/issues/143) - Kudos to [gongpeione](https://github.com/gongpeione) for reporting and adding fixing.

## [2.0.3] - 2022-04-13

### Fixed 
- Bump minimist from 1.2.5 to 1.2.6 (Security fix) [#140](https://github.com/vlio20/utils-decorators/pull/140)

## [2.0.2] - 2022-02-11

### Enchantments
- Update dependencies [136](https://github.com/vlio20/utils-decorators/pull/136) closes [#135](https://github.com/vlio20/utils-decorators/issues/135)

## [2.0.1] - 2021-12-20

### Bug Fixes

- `throttle-async` is not functioning as expected [132](https://github.com/vlio20/utils-decorators/pull/132) closes [#133](https://github.com/vlio20/utils-decorators/issues/133)

## [2.0.0] - 2021-12-07

### Enchantments

- Support better types [131](https://github.com/vlio20/utils-decorators/pull/131) - Kudos to [tripodsgames](https://github.com/tripodsgames) for reporting and fixing.

## [1.10.4] - 2021-10-22

### Fixed

- Fixing delegatify export [a8f3d74](https://github.com/vlio20/utils-decorators/commit/a8f3d74886091f4a36c653e2c9d2a8454cf38ef4) closes [#125](https://github.com/vlio20/utils-decorators/issues/125) - Kudos to [tripodsgames](https://github.com/tripodsgames) for reporting and fixing.
- Bump ansi-regex from 5.0.0 to 5.0.1 (Security fix) [c0ce96a](https://github.com/vlio20/utils-decorators/commit/c0ce96a285781672c3dfb6bf97992acd5584aed7).

## [1.10.3] - 2021-10-12

### Fixed

- Moving build target to es6 [cc33bc8](https://github.com/vlio20/utils-decorators/commit/cc33bc806e68e38ae69a772c5f4ebad27d912b4c) closes [#122](https://github.com/vlio20/utils-decorators/issues/122).
- Bump tmpl from 1.0.4 to 1.0.5 (Security fix) [8afe88d](https://github.com/vlio20/utils-decorators/commit/8afe88dd0012c7badb6e91d764ff4ecf39102a6a).

## [1.10.2] - 2021-09-10

### Fixed

- Adding a return value for the @before & @after decorators [8b89113](https://github.com/vlio20/utils-decorators/commit/8b891138c50f0a0ec510fa9d6caaca98258d8130) closes [#117](https://github.com/vlio20/utils-decorators/issues/117) - Kudos to [tyllo](https://github.com/tyllo) for reporting and fixing. 
- Bump path-parse from 1.0.6 to 1.0.7 (Security fix) [c783fd3](https://github.com/vlio20/utils-decorators/pull/116/commits/c783fd339e78524cd6dfd6da695911e04df30de9) 
