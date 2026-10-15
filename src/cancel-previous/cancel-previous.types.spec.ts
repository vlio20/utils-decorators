import { cancelPreviousify, cancelPrevious } from '../index';

function typeChecks() {
  const wrapped = cancelPreviousify(async function (this: { base: number }, id: number, suffix?: string, ...flags: boolean[]): Promise<number> {
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
    // @ts-expect-error Async decorators cannot change a synchronous signature.
    @cancelPrevious()
    foo(): number { return 1; }
  }
  // @ts-expect-error Promise-returning input required.
  cancelPreviousify((id: number) => id);
}

it('checks the public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
