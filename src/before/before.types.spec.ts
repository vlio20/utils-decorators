/* eslint-disable class-methods-use-this */
import { before, beforify } from '../index';

function typeChecks(flag: boolean): void {
  const beforeValue: number = beforify(() => 1, { func: () => {} })();
  const beforePromise: Promise<number> = beforify(() => 1, { func: () => {}, wait: true })();
  const customPromise = Promise.resolve(1) as Promise<number> & { requiredTag: string };
  const invalidHook = flag ? 'missing' as const : () => {};
  const unionWait = flag ? { wait: true as const, func: () => {} } : { wait: false as const, func: () => {} };
  const optionalWait: { func: () => void; wait?: boolean } = { func: () => {} };
  class PromiseResults {
    // @ts-expect-error A callback alternative must not hide an invalid named hook.
    @before({ func: invalidHook })
    invalidBeforeUnion(): number { return 1; }
    // @ts-expect-error One member of a config union may return a native Promise.
    @before(unionWait)
    beforeConfigUnion(): typeof customPromise { return customPromise; }
    @before({ func: () => {} })
    preserveBefore(): typeof customPromise { return customPromise; }
    // @ts-expect-error Waiting before a method returns a native Promise.
    @before({ func: () => {}, wait: true })
    beforeCustom(): typeof customPromise { return customPromise; }
    // @ts-expect-error Optional wait may return a native Promise.
    @before(optionalWait)
    beforeOptional(): typeof customPromise { return customPromise; }
  }
  class Example {
    // @ts-expect-error Missing before hook.
    @before({ func: 'doesNotExist' })
    beforeMissing(): number { return 1; }
    // @ts-expect-error Waiting before hooks requires async methods.
    @before({ func: () => {}, wait: true })
    beforeSync(): number { return 1; }
  }
}

it('checks before public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
