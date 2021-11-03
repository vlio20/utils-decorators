import { Method } from '../common/model/common.model';
import { AfterConfig, AfterFunc } from './after.model';

export function afterify<M extends Method<any>>(
  originalMethod: M, config: AfterConfig<any, ReturnType<typeof originalMethod>>,
): (...args: any[]) => void {
  const resolvedConfig: AfterConfig<any, ReturnType<typeof originalMethod>> = {
    wait: false,
    ...config,
  };

  return async function (...args: any[]): Promise<void> {
    const afterFunc: AfterFunc<ReturnType<typeof originalMethod>> = typeof resolvedConfig.func === 'string'
      ? this[resolvedConfig.func].bind(this)
      : resolvedConfig.func;

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
