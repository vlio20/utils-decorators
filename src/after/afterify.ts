import { Method } from '../common/model/common.model';
import { AfterConfig, AfterFunc } from './after.model';

export function afterify<D, A extends unknown[], T>(
  originalMethod: Method<D, A, T>, config: AfterConfig<NoInfer<T>, NoInfer<Awaited<D>>, NoInfer<A>> & { wait: true },
): Method<D extends PromiseLike<unknown> ? Promise<Awaited<D>> : D, A, T>;
export function afterify<D, A extends unknown[], T>(
  originalMethod: Method<D, A, T>, config: AfterConfig<NoInfer<T>, NoInfer<D>, NoInfer<A>> & { wait?: false },
): Method<D, A, T>;
export function afterify<D, A extends unknown[], T>(
  originalMethod: Method<D, A, T>, config: AfterConfig<NoInfer<T>, NoInfer<D | Awaited<D>>, NoInfer<A>>,
): Method<D | (D extends PromiseLike<unknown> ? Promise<Awaited<D>> : never), A, T>;
export function afterify(originalMethod: Method<any>, config: AfterConfig<any, any, any>): Method<any> {
  return function (this: any, ...args: any[]): any {
    const hook: AfterFunc<any, any> = typeof config.func === 'function' ? config.func : this[config.func].bind(this);
    const response = originalMethod.apply(this, args);
    if (config.wait && response != null && typeof response.then === 'function') {
      return Promise.resolve(response).then((result) => {
        hook({ args, response: result });
        return result;
      });
    }
    hook({ args, response });
    return response;
  };
}
