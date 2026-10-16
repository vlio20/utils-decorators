import { Method, CompatibleKeys } from '../common/model/common.model';
import { ExactTimeReportData, ReportFunction } from './exec-time.model';

const reporter: ReportFunction = (data: ExactTimeReportData): void => {
  // eslint-disable-next-line no-console
  console.info(data.execTime);
};
export function execTimify<D, A extends unknown[], T>(
  originalMethod: Method<D, A, T>,
  arg?: ReportFunction<NoInfer<Awaited<D>>, NoInfer<A>> | CompatibleKeys<NoInfer<T>, [ExactTimeReportData<Awaited<D>, A>]>,
): Method<D extends PromiseLike<unknown> ? Promise<Awaited<D>> : D, A, T>;
export function execTimify(originalMethod: Method<any>, arg?: ReportFunction<any, any> | PropertyKey): Method<any> {
  const input = arg ?? reporter;

  return function (this: any, ...args: any[]): any {
    const report = typeof input === 'function' ? input : this[input].bind(this);
    const start = Date.now();
    const finish = (result: any) => {
      report({ args, result, execTime: Date.now() - start });

      return result;
    };
    const result = originalMethod.apply(this, args);

    return result != null && typeof result.then === 'function' ? Promise.resolve(result).then(finish) : finish(result);
  };
}
