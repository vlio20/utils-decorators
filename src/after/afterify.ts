import { AfterConfig, AfterFunc } from './after.model';
import { Method } from '../common/model/common.model';

export function afterify<D = any>(originalMethod: Method<D>, config: AfterConfig<any, D>): (...args: any[]) => void {
  const resolvedConfig: AfterConfig<any, D> = {
    wait: false,
    ...config,
  };

  return async function (...args: any[]): Promise<void> {
    const afterFunc: AfterFunc<D> = typeof resolvedConfig.func === 'string' ? this[resolvedConfig.func].bind(this)
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
