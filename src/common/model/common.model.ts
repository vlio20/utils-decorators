export type Method<D, A extends unknown[] = unknown[], This = unknown> = (this: This, ...args: A) => D;
export type AsyncMethod<D, A extends unknown[] = unknown[], This = unknown> = (this: This, ...args: A) => Promise<D>;
export type UnboxPromise<T extends PromiseLike<unknown>> = Awaited<T>;

/** Function constraint only; concrete signatures are retained by generic wrappers. */
export type AnyMethod = (this: any, ...args: any[]) => any;
/** Native promises cannot preserve required properties of custom promise results. */
export type PromiseReturnCompatible<F extends AnyMethod> = Promise<Awaited<ReturnType<F>>> extends ReturnType<F> ? unknown : never;
type NormalizedReturn<R> = R extends PromiseLike<unknown> ? Promise<Awaited<R>> : R;
export type NormalizedReturnCompatible<F extends AnyMethod> = [NormalizedReturn<ReturnType<F>>] extends [ReturnType<F>] ? unknown : never;
export type CompatibleKeys<T, A extends unknown[], R = unknown> = {
  [K in keyof T]-?: T[K] extends (...args: A) => R ? K : never;
}[keyof T];
export type Decorator<T = unknown> = <F extends AnyMethod>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F>
) => TypedPropertyDescriptor<F>;
export type AsyncDecorator<T = unknown> = <F extends (this: any, ...args: any[]) => Promise<any>>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F> & PromiseReturnCompatible<F>
) => TypedPropertyDescriptor<F>;

/** Collect property values from every union member, including optional properties. */
export type ConfigProperty<C, K extends PropertyKey> = C extends unknown
  ? K extends keyof C ? Exclude<C[K], undefined> : never
  : never;

/** Validate all possible resolver values together so invalid union members cannot disappear. */
export type ResolverValidation<C, T, F extends AnyMethod> = [ConfigProperty<C, 'keyResolver'>] extends [
  ((...args: Parameters<F>) => string) | CompatibleKeys<T, Parameters<F>, string>
] ? unknown : never;

export type AsyncReturnValidation<F extends AnyMethod> = [ReturnType<F>] extends [Promise<unknown>]
  ? PromiseReturnCompatible<F> : never;
