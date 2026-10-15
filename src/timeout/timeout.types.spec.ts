/* eslint-disable class-methods-use-this */
import { timeoutify, timeout } from '../index';

function typeChecks() {
  const wrapped = timeoutify(async function (this: { base: number }, id: number, suffix?: string, ...flags: boolean[]): Promise<number> {
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
    // @ts-expect-error Async decorators cannot change a synchronous signature.
    @timeout(10)
    foo(): number { return 1; }
  }
  // @ts-expect-error Promise-returning input required.
  timeoutify((id: number) => id, 10);
}

it('checks the public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});

function checkPromiseCompatibility(): void {
  const customPromise = Promise.resolve(1) as Promise<number> & { requiredTag: string };
  class PromiseResults {
    // @ts-expect-error Timeouts return a native Promise.
    @timeout(100)
    timeoutCustom(): typeof customPromise { return customPromise; }
  }
}

it('checks timeout public signatures at compile time', () => {
  expect(checkPromiseCompatibility).toBeDefined();
});
