import { Method } from '../common/model/common.model';
import { BeforeConfig } from './before.model';

export function beforify<D, A extends unknown[], T>(
  originalMethod: Method<D, A, T>, config: BeforeConfig<NoInfer<T>> & { wait: true },
): Method<Promise<Awaited<D>>, A, T>;
export function beforify<D, A extends unknown[], T>(
  originalMethod: Method<D, A, T>, config: BeforeConfig<NoInfer<T>> & { wait?: false },
): Method<D, A, T>;
export function beforify<D, A extends unknown[], T>(
  originalMethod: Method<D, A, T>, config: BeforeConfig<NoInfer<T>>,
): Method<D | Promise<Awaited<D>>, A, T>;
export function beforify(originalMethod: Method<any>, config: BeforeConfig<any>): Method<any> {
  return function (this: any, ...args: any[]): any {
    const hook = typeof config.func === 'function' ? config.func : this[config.func].bind(this);
    if (config.wait) {
      return (async () => {
        await hook();
        return originalMethod.apply(this, args);
      })();
    }
    hook();
    return originalMethod.apply(this, args);
  };
}
