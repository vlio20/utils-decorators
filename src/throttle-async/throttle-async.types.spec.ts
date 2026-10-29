import { throttleAsyncify, throttleAsync } from '../index';

function checkTypes(): void {
  const wrapped = throttleAsyncify(async function (this: { offset: number }, id: number, label?: string, ...flags: boolean[]) {
    return this.offset + id + (label?.length ?? 0) + flags.length;
  });
  const receiver = { offset: 1, wrapped };
  const result: Promise<number> = receiver.wrapped(1, 'item', true);
  // @ts-expect-error The inferred resolved value is number, not string or any.
  const wrongResult: Promise<string> = receiver.wrapped(1);
  receiver.wrapped(1);
  // @ts-expect-error Required argument is retained.
  receiver.wrapped();
  // @ts-expect-error Optional argument is checked.
  receiver.wrapped(1, false);
  // @ts-expect-error Rest element type is checked.
  receiver.wrapped(1, 'item', 3);
  // @ts-expect-error The receiver is required.
  wrapped(1);
  // @ts-expect-error Only promise-returning functions can be queued.
  throttleAsyncify((id: number) => id);

  class Service {
    @throttleAsync(5)
    private async privateMethod(id: number): Promise<number> {
      void this;

      return id;
    }

    @throttleAsync(5)
    protected async protectedMethod(id: number): Promise<number> {
      void this;

      return id;
    }

    @throttleAsync()
    async valid(id: number): Promise<number> {
      void this;

      return id;
    }

    // @ts-expect-error A synchronous method cannot be decorated with an async wrapper.
    @throttleAsync()
    invalid(): number {
      void this;

      return 1;
    }

    // @ts-expect-error Queuing creates a native promise without custom promise properties.
    @throttleAsync()
    customPromise(): Promise<number> & { tag: string } {
      void this;

      return Object.assign(Promise.resolve(1), { tag: 'custom' });
    }

    // @ts-expect-error Only methods can be decorated.
    @throttleAsync()
    field = 1;
  }
  const decoratedResult: Promise<number> = new Service().valid(1);
  void decoratedResult;
  void result;
  void wrongResult;
}

it('checks inferred throttleAsync signatures at compile time', () => {
  expect(checkTypes).toBeDefined();
});
