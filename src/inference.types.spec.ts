import {
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
