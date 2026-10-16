/* eslint-disable class-methods-use-this */
import { onError, onErrorify } from '../index';

function typeChecks(flag: boolean): void {
  const owner = {
    recover(error: unknown, args: [number]) { return 'fallback'; },
    source(this: { recover(error: unknown, args: [number]): string }, id: number) { return id; },
  };
  const namedRecovery: Promise<number | string> = onErrorify(owner.source, { func: 'recover' }).call(owner, 1);
  const recovery: Promise<number | string> = onErrorify(async (id: number) => id, { func: (error, args) => {
    const unknownError: unknown = error;
    const tuple: [number] = args;

    return 'fallback';
  } })(1);
  const customPromise = Promise.resolve(1) as Promise<number> & { requiredTag: string };
  class PromiseResults {
    // @ts-expect-error Every possible recovery handler must be compatible.
    @onError({ func: flag ? 'missing' as const : () => 1 })
    async invalidRecoveryUnion(): Promise<number> { return 1; }
    // @ts-expect-error Recovery returns a native Promise.
    @onError({ func: () => 1 })
    recoverCustom(): typeof customPromise { return customPromise; }
  }
  class Example {
    @onError({ func: (error, args) => {
      // @ts-expect-error JavaScript may throw any value.
      error.message.toUpperCase();
      // @ts-expect-error Uninferred handler arguments must not silently become any.
      args[0].toFixed();

      return 1;
    } })
    async safeRecover(id: number): Promise<number> { return id; }
    wrongRecovery() { return 'bad'; }
    // @ts-expect-error Incompatible recovery result.
    @onError({ func: 'wrongRecovery' })
    async recover(): Promise<number> { return 1; }
  }
}

it('checks on-error public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
