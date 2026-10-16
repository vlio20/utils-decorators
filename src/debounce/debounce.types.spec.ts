import { debouncify, debounce } from '../index';

function checkTypes(): void {
  const wrapped = debouncify(function (this: { offset: number }, id: number, label?: string, ...flags: boolean[]) {
    return this.offset + id + (label?.length ?? 0) + flags.length;
  }, 10);
  const receiver = { offset: 1, wrapped };
  const result: void = receiver.wrapped(1, 'item', true, false);
  receiver.wrapped(1);
  // @ts-expect-error Required argument is retained.
  receiver.wrapped();
  // @ts-expect-error Optional argument must still be a string.
  receiver.wrapped(1, false);
  // @ts-expect-error Rest arguments retain their element type.
  receiver.wrapped(1, 'item', 2);
  // @ts-expect-error The receiver requirement is retained.
  wrapped(1);

  class Service {
    @debounce(10)
    valid(id: number): void { void this; void id; }

    // @ts-expect-error A legacy decorator cannot change a number return type to void.
    @debounce(10)
    invalid(): number {
      void this;

      return 1;
    }

    // @ts-expect-error Scheduled calls do not return the original promise.
    @debounce(10)
    async invalidAsync(): Promise<void> { void this; }

    // @ts-expect-error A union containing a value is not a void return.
    @debounce(10)
    invalidUnion(): number | void {
      void this;

      return 1;
    }

    // @ts-expect-error A scheduled method cannot preserve a never return.
    @debounce(10)
    invalidNever(): never {
      void this;

      throw new Error('failure');
    }

    // @ts-expect-error Only methods can be decorated.
    @debounce(10)
    field = 1;
  }
  void result;
  void Service;
}

it('checks inferred debounce signatures at compile time', () => {
  expect(checkTypes).toBeDefined();
});
