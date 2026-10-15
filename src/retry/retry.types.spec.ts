/* eslint-disable class-methods-use-this */
import { retryfy, retry } from '../index';

function typeChecks() {
  // @ts-expect-error Retry counts and explicit delay arrays are mutually exclusive.
  retryfy(async () => 1, { retries: 2, delaysArray: [1, 2] });
  // @ts-expect-error Decorator configurations reject mutually exclusive retry options.
  retry({ retries: 2, delaysArray: [1, 2] });
  const wrapped = retryfy(async function (this: { base: number }, id: number, suffix?: string, ...flags: boolean[]): Promise<number> {
    return this.base + id + (suffix?.length ?? 0) + flags.length;
  }, 10);
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
    goodHook(_error: unknown, count: number): void { this.field += count; }
    badHook(_error: unknown, count: string): void { this.field += count.length; }
    @retry({ retries: 1, onRetry: 'goodHook' })
    async valid(): Promise<number> { return this.field; }
    // @ts-expect-error Retry hook must accept the retries count as a number.
    @retry({ retries: 1, onRetry: 'badHook' })
    async wrongHook(): Promise<number> { return this.field; }
    // @ts-expect-error Retry hook must be callable.
    @retry({ retries: 1, onRetry: 'field' })
    async wrongField(): Promise<number> { return this.field; }

    // @ts-expect-error Async decorators cannot change a synchronous signature.
    @retry(10)
    foo(): number { return 1; }
  }
  // @ts-expect-error Promise-returning input required.
  retryfy((id: number) => id, 10);
}

it('checks the public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});

function checkPromiseCompatibility(): void {
  const customPromise = Promise.resolve(1) as Promise<number> & { requiredTag: string };
  class PromiseResults {
    // @ts-expect-error Retrying returns a native Promise.
    @retry({ retries: 2 })
    retryCustom(): typeof customPromise { return customPromise; }
  }
}

it('checks retry public signatures at compile time', () => {
  expect(checkPromiseCompatibility).toBeDefined();
});
