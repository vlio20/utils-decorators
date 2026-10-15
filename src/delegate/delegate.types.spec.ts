/* eslint-disable class-methods-use-this */
import { delegate, delegatify } from '../index';

function typeChecks(): void {
  const delegated = delegatify(async (id: number) => id);
  // @ts-expect-error Wrong arguments.
  delegated('bad');
  // @ts-expect-error Async-only wrapper.
  delegatify(() => 1);
  const customPromise = Promise.resolve(1) as Promise<number> & { requiredTag: string };
  class PromiseResults {
    // @ts-expect-error Delegation can lose custom Promise properties.
    @delegate()
    delegateCustom(): typeof customPromise { return customPromise; }
  }
}

it('checks delegate public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
