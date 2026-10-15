/* eslint-disable class-methods-use-this */
import { after, afterify, AfterParams } from '../index';

function typeChecks(flag: boolean): void {
  const source = function (this: { base: number }, id: number, label?: string, ...rest: number[]) {
    return this.base + id + (label?.length ?? 0) + rest.length;
  };
  const wrapped = afterify(source, { func: ({ args, response }) => {
    const tuple: [number, string?, ...number[]] = args;
    const number: number = response;
  } });
  const value: number = wrapped.call({ base: 1 }, 2);
  // @ts-expect-error Receiver required.
  wrapped(2);
  // @ts-expect-error Wrong arguments.
  wrapped.call({ base: 1 }, 'bad');
  // @ts-expect-error Callback cannot widen original arguments.
  afterify((id: number) => id, { func: ({ args }: AfterParams<number, [string]>) => {} });
  // @ts-expect-error Callback cannot change original return type.
  afterify((id: number) => id, { func: ({ response }: AfterParams<string, [number]>) => {} });
  afterify(async () => 1, { wait: true, func: ({ response }) => { const result: number = response; } });
  afterify(async () => 1, { func: ({ response }) => { const result: Promise<number> = response; } });
  afterify(async () => 1, { wait: flag, func: ({ response }) => { const result: number | Promise<number> = response; } });
  const optional: { wait?: boolean; func: (data: AfterParams<number | Promise<number>, []>) => void } = { func: () => {} };
  afterify(async () => 1, optional);
  const customPromise = Promise.resolve(1) as Promise<number> & { requiredTag: string };
  const customThenable: PromiseLike<number> & { requiredTag: string } = customPromise;
  const invalidHook = flag ? 'missing' as const : () => {};
  const unionWait = flag ? { wait: true as const, func: () => {} } : { wait: false as const, func: () => {} };
  const optionalWait: { func: () => void; wait?: boolean } = { func: () => {} };
  class PromiseResults {
    // @ts-expect-error Every possible named hook must exist.
    @after({ func: invalidHook })
    invalidAfterUnion(): number { return 1; }
    // @ts-expect-error One member of a config union may normalize the custom Promise.
    @after(unionWait)
    afterConfigUnion(): typeof customPromise { return customPromise; }
    @after({ func: () => {} })
    preserveAfter(): typeof customPromise { return customPromise; }
    // @ts-expect-error Waiting normalizes the custom Promise and loses requiredTag.
    @after({ func: () => {}, wait: true })
    afterCustom(): typeof customPromise { return customPromise; }
    // @ts-expect-error A runtime boolean may normalize a custom thenable.
    @after({ func: () => {}, wait: flag })
    afterThenable(): typeof customThenable { return customThenable; }
    // @ts-expect-error Optional wait may normalize a custom promise.
    @after(optionalWait)
    afterOptional(): typeof customPromise { return customPromise; }
  }
  class Example {
    numeric = 1;
    @after({ func: ({ response, args }) => {
      // @ts-expect-error Legacy decorator factories cannot infer from the method: use safe unknown.
      response.toFixed();
      // @ts-expect-error Uninferred argument values must not silently become any.
      args[0].toFixed();
    } })
    safeAfter(id: number): number { return id; }
    @after({ func: ({ response }: AfterParams<number, [number]>) => response.toFixed() })
    annotatedAfter(id: number): number { return id; }
    incompatible(data: AfterParams<string, [number]>) { return data.response; }
    // @ts-expect-error Missing named hook.
    @after({ func: 'doesNotExist' })
    missing(): number { return 1; }
    // @ts-expect-error Noncallable named hook.
    @after({ func: 'numeric' })
    invalid(): number { return 1; }
    // @ts-expect-error Wrong hook response.
    @after({ func: 'incompatible' })
    wrong(id: number): number { return id; }
    // @ts-expect-error Wrong callback response.
    @after({ func: ({ response }: AfterParams<string>) => response.toUpperCase() })
    badCallback(): number { return 1; }
  }
}

it('checks after public signatures at compile time', () => {
  expect(typeChecks).toBeDefined();
});
