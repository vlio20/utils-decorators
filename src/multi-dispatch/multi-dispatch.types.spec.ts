/* eslint-disable class-methods-use-this */
import { multiDispatch, multiDispatchify } from '../index';

function typeChecks(): void {
  const dispatched = multiDispatchify(async (id: number) => id, 2);
  // @ts-expect-error Wrong arguments.
  dispatched('bad');
  const customPromise = Promise.resolve(1) as Promise<number> & { requiredTag: string };
  class PromiseResults {
    // @ts-expect-error Multiple dispatches return a native Promise.
    @multiDispatch(2)
    dispatchCustom(): typeof customPromise { return customPromise; }
  }
}

it('checks multi-dispatch public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
