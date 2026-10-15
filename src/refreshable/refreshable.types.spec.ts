import { refreshable, RefreshableConfig } from '../index';

function checkTypes(): void {
  const decorate = refreshable({ dataProvider: async () => 1, intervalMs: 10 });
  const target = { value: undefined as number | undefined, wrong: '', unsafe: 1 };
  decorate(target, 'value');
  // @ts-expect-error The provider value must fit the property.
  decorate(target, 'wrong');
  // @ts-expect-error The initial value is undefined until the first refresh.
  decorate(target, 'unsafe');
  // @ts-expect-error Providers are invoked without arguments.
  refreshable({ dataProvider: async (id: number) => id, intervalMs: 10 });
  // @ts-expect-error Providers cannot require a receiver.
  refreshable({ dataProvider: async function (this: { id: number }) { return this.id; }, intervalMs: 10 });
  const config: RefreshableConfig<number> = { dataProvider: async () => 1, intervalMs: 10 };
  class Service {
    @refreshable(config)
    value: number | undefined;

    // @ts-expect-error A property must include the initial undefined value.
    @refreshable(config)
    unsafe = 1;
  }
  void Service;
}

it('checks inferred refreshable signatures at compile time', () => {
  expect(checkTypes).toBeDefined();
});
