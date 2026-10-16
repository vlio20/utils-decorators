import { AnyMethod, CompatibleKeys, PromiseReturnCompatible } from '../common/model/common.model';
import { OnErrorHandler } from './on-error.model';
import { onErrorify } from './on-errorify';

type ContextualHandler = { handle(error: unknown, args: unknown[]): unknown }['handle'];

export function onError<const C extends { func: ContextualHandler | PropertyKey }>(config: C) {
  return <T, F extends AnyMethod>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<F> & PromiseReturnCompatible<F> & (ReturnType<F> extends Promise<unknown>
      ? [C['func']] extends [CompatibleKeys<T, [unknown, Parameters<F>], Awaited<ReturnType<F>> | PromiseLike<Awaited<ReturnType<F>>>>
        | OnErrorHandler<Awaited<ReturnType<F>> | PromiseLike<Awaited<ReturnType<F>>>, Parameters<F>>] ? unknown : never : never),
  ): TypedPropertyDescriptor<F> => {
    if (descriptor?.value) {
      descriptor.value = onErrorify(descriptor.value, config as any) as F;

      return descriptor;
    }

    throw new Error('@onError is applicable only on a methods.');
  };
}
