/* eslint-disable class-methods-use-this */
import {
  after, afterify, AfterParams, before, beforify, execTime, execTimify, onError, onErrorify,
  delegate, delegatify, multiDispatch, multiDispatchify, cancelPrevious, retry, timeout,
} from '../index';

function typeChecks(flag: boolean) {
  const source = function (this: { base: number }, id: number, label?: string, ...rest: number[]) {
    return this.base + id + (label?.length ?? 0) + rest.length;
  };
  const wrapped = afterify(source, { func: ({ args, response }) => {
    const tuple: [number, string?, ...number[]] = args;
    const number: number = response;
  } });
  const value: number = wrapped.call({ base: 1 }, 2);
  // @ts-expect-error Receiver required.
  wrapped(2);
  // @ts-expect-error Wrong arguments.
  wrapped.call({ base: 1 }, 'bad');
  // @ts-expect-error Callback cannot widen original arguments.
  afterify((id: number) => id, { func: ({ args }: AfterParams<number, [string]>) => {} });
  // @ts-expect-error Callback cannot change original return type.
  afterify((id: number) => id, { func: ({ response }: AfterParams<string, [number]>) => {} });
  afterify(async () => 1, { wait: true, func: ({ response }) => { const result: number = response; } });
  afterify(async () => 1, { func: ({ response }) => { const result: Promise<number> = response; } });
  afterify(async () => 1, { wait: flag, func: ({ response }) => { const result: number | Promise<number> = response; } });
  const optional: { wait?: boolean; func: (data: AfterParams<number | Promise<number>, []>) => void } = { func: () => {} };
  afterify(async () => 1, optional);
  const beforeValue: number = beforify(() => 1, { func: () => {} })();
  const beforePromise: Promise<number> = beforify(() => 1, { func: () => {}, wait: true })();
  const reportValue: number = execTimify(() => 1, ({ result, args }) => { const number: number = result; const tuple: [] = args; })();
  const owner = {
    recover(error: unknown, args: [number]) { return 'fallback'; },
    source(this: { recover(error: unknown, args: [number]): string }, id: number) { return id; },
  };
  const namedRecovery: Promise<number | string> = onErrorify(owner.source, { func: 'recover' }).call(owner, 1);
  const recovery: Promise<number | string> = onErrorify(async (id: number) => id, { func: (error, args) => {
    const unknownError: unknown = error;
    const tuple: [number] = args;
    return 'fallback';
  } })(1);
  const delegated = delegatify(async (id: number) => id);
  const dispatched = multiDispatchify(async (id: number) => id, 2);
  // @ts-expect-error Wrong arguments.
  delegated('bad');
  // @ts-expect-error Wrong arguments.
  dispatched('bad');
  // @ts-expect-error Async-only wrapper.
  delegatify(() => 1);
  const customPromise = Promise.resolve(1) as Promise<number> & { requiredTag: string };
  const customThenable: PromiseLike<number> & { requiredTag: string } = customPromise;
  const invalidHook = flag ? 'missing' as const : () => {};
  const unionWait = flag ? { wait: true as const, func: () => {} } : { wait: false as const, func: () => {} };
  const validHook = flag ? 'validHook' as const : () => {};
  const optionalWait: { func: () => void; wait?: boolean } = { func: () => {} };
  class PromiseResults {
    validHook() {}
    @after({ func: validHook })
    @before({ func: validHook })
    @execTime(validHook)
    validUnion(): number { return 1; }
    // @ts-expect-error Every possible named hook must exist.
    @after({ func: invalidHook })
    invalidAfterUnion(): number { return 1; }
    // @ts-expect-error A callback alternative must not hide an invalid named hook.
    @before({ func: invalidHook })
    invalidBeforeUnion(): number { return 1; }
    // @ts-expect-error Every possible reporter must be compatible.
    @execTime(invalidHook)
    invalidReportUnion(): number { return 1; }
    // @ts-expect-error Every possible recovery handler must be compatible.
    @onError({ func: flag ? 'missing' as const : () => 1 })
    async invalidRecoveryUnion(): Promise<number> { return 1; }
    // @ts-expect-error One member of a config union may normalize the custom Promise.
    @after(unionWait)
    afterConfigUnion(): typeof customPromise { return customPromise; }
    // @ts-expect-error One member of a config union may return a native Promise.
    @before(unionWait)
    beforeConfigUnion(): typeof customPromise { return customPromise; }
    @after({ func: () => {} })
    preserveAfter(): typeof customPromise { return customPromise; }
    @before({ func: () => {} })
    preserveBefore(): typeof customPromise { return customPromise; }
    // @ts-expect-error Waiting normalizes the custom Promise and loses requiredTag.
    @after({ func: () => {}, wait: true })
    afterCustom(): typeof customPromise { return customPromise; }
    // @ts-expect-error A runtime boolean may normalize a custom thenable.
    @after({ func: () => {}, wait: flag })
    afterThenable(): typeof customThenable { return customThenable; }
    // @ts-expect-error Optional wait may normalize a custom promise.
    @after(optionalWait)
    afterOptional(): typeof customPromise { return customPromise; }
    // @ts-expect-error Waiting before a method returns a native Promise.
    @before({ func: () => {}, wait: true })
    beforeCustom(): typeof customPromise { return customPromise; }
    // @ts-expect-error Optional wait may return a native Promise.
    @before(optionalWait)
    beforeOptional(): typeof customPromise { return customPromise; }
    // @ts-expect-error Reporting a thenable returns a native Promise.
    @execTime()
    reportCustom(): typeof customThenable { return customThenable; }
    // @ts-expect-error Recovery returns a native Promise.
    @onError({ func: () => 1 })
    recoverCustom(): typeof customPromise { return customPromise; }
    // @ts-expect-error Cancellation returns a native Promise.
    @cancelPrevious()
    cancelCustom(): typeof customPromise { return customPromise; }
    // @ts-expect-error Retrying returns a native Promise.
    @retry({ retries: 2 })
    retryCustom(): typeof customPromise { return customPromise; }
    // @ts-expect-error Timeouts return a native Promise.
    @timeout(100)
    timeoutCustom(): typeof customPromise { return customPromise; }
    // @ts-expect-error Multiple dispatches return a native Promise.
    @multiDispatch(2)
    dispatchCustom(): typeof customPromise { return customPromise; }
    // @ts-expect-error Delegation can lose custom Promise properties.
    @delegate()
    delegateCustom(): typeof customPromise { return customPromise; }
    @after({ func: () => {}, wait: true })
    @before({ func: () => {}, wait: true })
    @execTime()
    @onError({ func: () => 1 })
    @cancelPrevious()
    @retry({ retries: 2 })
    @timeout(100)
    @multiDispatch(2)
    @delegate()
    ordinaryPromise(): Promise<number> { return Promise.resolve(1); }
  }
  class Example {
    numeric = 1;
    @after({ func: ({ response, args }) => {
      // @ts-expect-error Legacy decorator factories cannot infer from the method: use safe unknown.
      response.toFixed();
      // @ts-expect-error Uninferred argument values must not silently become any.
      args[0].toFixed();
    } })
    safeAfter(id: number): number { return id; }
    @after({ func: ({ response }: AfterParams<number, [number]>) => response.toFixed() })
    annotatedAfter(id: number): number { return id; }
    @execTime(({ result, args }) => {
      // @ts-expect-error Reporter result is unknown until narrowed or annotated.
      result.toFixed();
      // @ts-expect-error Reporter arguments are unknown until narrowed or annotated.
      args[0].toFixed();
    })
    safeReport(id: number): number { return id; }
    @onError({ func: (error, args) => {
      // @ts-expect-error JavaScript may throw any value.
      error.message.toUpperCase();
      // @ts-expect-error Uninferred handler arguments must not silently become any.
      args[0].toFixed();
      return 1;
    } })
    async safeRecover(id: number): Promise<number> { return id; }
    incompatible(data: AfterParams<string, [number]>) { return data.response; }
    wrongRecovery() { return 'bad'; }
    // @ts-expect-error Missing named hook.
    @after({ func: 'doesNotExist' })
    missing(): number { return 1; }
    // @ts-expect-error Noncallable named hook.
    @after({ func: 'numeric' })
    invalid(): number { return 1; }
    // @ts-expect-error Wrong hook response.
    @after({ func: 'incompatible' })
    wrong(id: number): number { return id; }
    // @ts-expect-error Wrong callback response.
    @after({ func: ({ response }: AfterParams<string>) => response.toUpperCase() })
    badCallback(): number { return 1; }
    // @ts-expect-error Missing before hook.
    @before({ func: 'doesNotExist' })
    beforeMissing(): number { return 1; }
    // @ts-expect-error Waiting before hooks requires async methods.
    @before({ func: () => {}, wait: true })
    beforeSync(): number { return 1; }
    // @ts-expect-error Missing reporter.
    @execTime('doesNotExist')
    reportMissing(): number { return 1; }
    // @ts-expect-error Noncallable reporter.
    @execTime('numeric')
    reportInvalid(): number { return 1; }
    // @ts-expect-error Incompatible recovery result.
    @onError({ func: 'wrongRecovery' })
    async recover(): Promise<number> { return 1; }
  }
}

describe('hook public types', () => {
  it('preserves synchronous results and reports original values', () => {
    const report = jest.fn();
    expect(afterify(() => 42, { func: report })()).toBe(42);
    expect(beforify(() => 42, { func: report })()).toBe(42);
    expect(execTimify(() => 42, report)()).toBe(42);
    expect(report.mock.calls[2][0].result).toBe(42);
  });
  it('reports resolved async values and returns recovery results', async () => {
    const report = jest.fn();
    await expect(afterify(async () => 42, { wait: true, func: report })()).resolves.toBe(42);
    expect(report.mock.calls[0][0].response).toBe(42);
    await expect(execTimify(async () => 42, report)()).resolves.toBe(42);
    expect(report.mock.calls[1][0].result).toBe(42);
    await expect(onErrorify(async () => { throw 'failure'; }, { func: () => 'recovered' })()).resolves.toBe('recovered');
  });
});
