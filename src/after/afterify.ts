import { Method } from '../common/model/common.model';
import { AfterConfig, AfterFunc } from './after.model';

export function afterify<D = any, A extends any[] = any[]>(
  originalMethod: Method<D, A>, config: AfterConfig<any, ReturnType<typeof originalMethod>>,
): (...args: any[]) => void {
  const resolvedConfig: AfterConfig<any, ReturnType<typeof originalMethod>> = {
    wait: false,
    ...config,
  };

  return async function (this: Record<PropertyKey, Method<any>>, ...args: A): Promise<D> {
    const afterFunc: AfterFunc<ReturnType<typeof originalMethod>> = typeof resolvedConfig.func === 'function'
      ? resolvedConfig.func
      : this[resolvedConfig.func].bind(this);

    if (resolvedConfig.wait) {
      const response = await originalMethod.apply(this, args);
      afterFunc({
        args,
        response,
      });
      return response;
    }

    const response = originalMethod.apply(this, args);
    afterFunc({
      args,
      response,
    });
    return response;
  };
}
