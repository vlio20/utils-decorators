import { AsyncMethod, Method } from '../common/model/common.model';
import { isPromise } from '../common/utils/utils';
import { ExactTimeReportData, ReportFunction } from './exec-time.model';

const reporter: ReportFunction = function (data: ExactTimeReportData): void {
  // eslint-disable-next-line no-console
  console.info(data.execTime);
};

export function execTimify<D = any, A extends any[] = any[]>(
  originalMethod: Method<D, A> | AsyncMethod<D, A>,
  arg?: ReportFunction | string,
): typeof originalMethod {
  const input: ReportFunction | string = arg ?? reporter;

  return function (...args: A) {
    const repFunc: ReportFunction = typeof input === 'string' ? this[input].bind(this) : input;
    const start = Date.now();
    const result = originalMethod.apply(this, args);

    if (isPromise(result)) {
      return result.then(resolved => {
        repFunc({
          args,
          result: resolved,
          execTime: Date.now() - start,
        });

        return resolved;
      });
    }

    repFunc({
      args,
      result,
      execTime: Date.now() - start,
    });

    return result;
  };
}
