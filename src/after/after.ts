import { AfterFunc, AfterParams } from './after.model';
import { AnyMethod, CompatibleKeys, NormalizedReturnCompatible } from '../common/model/common.model';
import { afterify } from './afterify';

type Response<F extends AnyMethod, C> = C extends { wait: true } ? Awaited<ReturnType<F>>
  : C extends { wait?: infer W } ? true extends W ? ReturnType<F> | Awaited<ReturnType<F>> : ReturnType<F> : ReturnType<F>;
type ValidHook<T, F extends AnyMethod, C extends { func: unknown }> = [C['func']] extends [
  CompatibleKeys<T, [AfterParams<Response<F, C>, Parameters<F>>]> | AfterFunc<Response<F, C>, Parameters<F>>
] ? unknown : never;

type ContextualHook = { hook(params: AfterParams): void }['hook'];

export function after<const C extends { func: ContextualHook | PropertyKey; wait?: boolean }>(config: C) {
  return <T, F extends AnyMethod>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F> & ValidHook<T, F, C>
      & (true extends (C extends { wait?: infer W } ? W : false) ? NormalizedReturnCompatible<F> : unknown),
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      descriptor.value = afterify(descriptor.value, config as any) as F;

      return descriptor;
    }

    throw new Error('@after is applicable only on a methods.');
  };
}
