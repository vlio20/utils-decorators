import { AnyMethod, CompatibleKeys, PromiseReturnCompatible } from '../common/model/common.model';
import { beforify } from './beforify';

export function before<const C extends { func: ((...args: any[]) => unknown) | PropertyKey; wait?: boolean }>(config: C) {
  return <T, F extends AnyMethod>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F> & ([C['func']] extends [((...args: Parameters<F>) => unknown) | CompatibleKeys<T, Parameters<F>>] ? unknown : never)
      & (true extends (C extends { wait?: infer W } ? W : false)
        ? ReturnType<F> extends Promise<unknown> ? PromiseReturnCompatible<F> : never : unknown),
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      descriptor.value = beforify(descriptor.value, config as any) as F;
      return descriptor;
    }
    throw new Error('@before is applicable only on a methods.');
  };
}
