import { AnyMethod, CompatibleKeys, Method } from '../common/model/common.model';
import { OnErrorConfig, OnErrorHandler } from './on-error.model';

export function onErrorify<D, A extends unknown[], T, K extends CompatibleKeys<NoInfer<T>, [unknown, NoInfer<A>]>>(
  originalMethod: Method<D, A, T>, config: { func: K },
): Method<Promise<Awaited<D> | Awaited<ReturnType<Extract<T[K], AnyMethod>>>>, A, T>;
export function onErrorify<D, A extends unknown[], T, H>(
  originalMethod: Method<D, A, T>, config: { func: OnErrorHandler<H, NoInfer<A>> },
): Method<Promise<Awaited<D> | Awaited<H>>, A, T>;
export function onErrorify<D, A extends unknown[], T, H>(
  originalMethod: Method<D, A, T>, config: OnErrorConfig<NoInfer<T>, H, NoInfer<A>>,
): Method<Promise<Awaited<D> | Awaited<H>>, A, T>;
export function onErrorify(originalMethod: Method<any>, config: OnErrorConfig<any, any, any>): Method<Promise<any>> {
  return async function (this: any, ...args: any[]): Promise<any> {
    const hook = typeof config.func === 'function' ? config.func : this[config.func].bind(this);
    try {
      return await originalMethod.apply(this, args);
    } catch (e) {
      return await hook(e, args);
    }
  };
}
