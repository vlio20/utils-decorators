import { readonly } from '../index';

function checkTypes(): void {
  const descriptor = readonly()({}, 'value', { value: 1 });
  const value: number | undefined = descriptor.value;
  // @ts-expect-error Descriptor value retains its type.
  const wrong: string = descriptor.value;
  const fieldResult: void = readonly()({}, Symbol('field'));
  class Service {
    @readonly()
    value = 1;

    @readonly()
    method(id: number): number { return this.value + id; }
  }
  const result: number = new Service().method(1);
  // @ts-expect-error The method parameter is retained.
  new Service().method('wrong');
  void value;
  void wrong;
  void fieldResult;
  void result;
}

it('checks readonly descriptor signatures at compile time', () => {
  expect(checkTypes).toBeDefined();
});
