import { delayfy, delay } from '../index';

function checkTypes(): void {
  const wrapped = delayfy(function (this: { offset: number }, id: number, label?: string, ...flags: boolean[]) {
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
    @delay(10)
    private privateMethod(id: number): void { void this; void id; }

    @delay(10)
    protected protectedMethod(id: number): void { void this; void id; }

    @delay(10)
    valid(id: number): void { void this; void id; }

    // @ts-expect-error A legacy decorator cannot change a number return type to void.
    @delay(10)
    invalid(): number {
      void this;

      return 1;
    }

    // @ts-expect-error Scheduled calls do not return the original promise.
    @delay(10)
    async invalidAsync(): Promise<void> { void this; }

    // @ts-expect-error A union containing a value is not a void return.
    @delay(10)
    invalidUnion(): number | void {
      void this;

      return 1;
    }

    // @ts-expect-error A scheduled method cannot preserve a never return.
    @delay(10)
    invalidNever(): never {
      void this;

      throw new Error('failure');
    }

    // @ts-expect-error Only methods can be decorated.
    @delay(10)
    field = 1;
  }
  void result;
  void Service;
}

it('checks inferred delay signatures at compile time', () => {
  expect(checkTypes).toBeDefined();
});
