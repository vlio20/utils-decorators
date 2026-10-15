/* eslint-disable class-methods-use-this */
import { execTime, execTimify } from '../index';

function typeChecks(flag: boolean): void {
  const reportValue: number = execTimify(() => 1, ({ result, args }) => { const number: number = result; const tuple: [] = args; })();
  const customPromise = Promise.resolve(1) as Promise<number> & { requiredTag: string };
  const customThenable: PromiseLike<number> & { requiredTag: string } = customPromise;
  const invalidHook = flag ? 'missing' as const : () => {};
  class PromiseResults {
    // @ts-expect-error Every possible reporter must be compatible.
    @execTime(invalidHook)
    invalidReportUnion(): number { return 1; }
    // @ts-expect-error Reporting a thenable returns a native Promise.
    @execTime()
    reportCustom(): typeof customThenable { return customThenable; }
  }
  class Example {
    numeric = 1;
    @execTime(({ result, args }) => {
      // @ts-expect-error Reporter result is unknown until narrowed or annotated.
      result.toFixed();
      // @ts-expect-error Reporter arguments are unknown until narrowed or annotated.
      args[0].toFixed();
    })
    safeReport(id: number): number { return id; }
    // @ts-expect-error Missing reporter.
    @execTime('doesNotExist')
    reportMissing(): number { return 1; }
    // @ts-expect-error Noncallable reporter.
    @execTime('numeric')
    reportInvalid(): number { return 1; }
  }
}

it('checks exec-time public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
