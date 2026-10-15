/* eslint-disable class-methods-use-this */
import {
  after, before, execTime, onError, cancelPrevious, retry, timeout, multiDispatch, delegate,
  afterify, beforify, cancelPreviousify, delegatify, execTimify, memoizify,
  memoizeAsyncify, multiDispatchify, rateLimitify, retryfy, throttleAsyncify, timeoutify,
} from './index';

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
function expectType<T extends true>(): void {}

function checkGenericInference(): void {
  const identity = <T>(value: T): T => value;
  const asyncIdentity = async <T>(value: T): Promise<T> => value;
  const input = { id: 42, label: 'item' };
  const syncResults = [
    memoizify(identity)(input),
    afterify(identity, { func: () => {} })(input),
    beforify(identity, { func: () => {} })(input),
    execTimify(identity)(input),
    rateLimitify(identity, { timeSpanMs: 10, allowedCalls: 1 })(input),
  ] as const;
  expectType<Equal<typeof syncResults[number], typeof input>>();
  const asyncResults = [
    memoizeAsyncify(asyncIdentity)(input),
    cancelPreviousify(asyncIdentity)(input),
    delegatify(asyncIdentity)(input),
    multiDispatchify(asyncIdentity, 1)(input),
    retryfy(asyncIdentity, 0)(input),
    throttleAsyncify(asyncIdentity)(input),
    timeoutify(asyncIdentity, 10)(input),
  ] as const;
  expectType<Equal<typeof asyncResults[number], Promise<typeof input>>>();
}

it('retains generic input and output relationships without caller annotations', () => {
  expect(checkGenericInference).toBeDefined();
});

function checkDecoratorComposition(flag: boolean): void {
  const validHook = flag ? 'validHook' as const : () => {};
  class Service {
    validHook() {}
    @after({ func: validHook })
    @before({ func: validHook })
    @execTime(validHook)
    validUnion(): number { return 1; }
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
}

it('checks composition across decorator families', () => {
  expect(checkDecoratorComposition).toBeDefined();
});
