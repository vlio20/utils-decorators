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
): AsyncMethod<void, A> {
  const input: ReportFunction | string = arg ?? reporter;

  return async function (...args: A): Promise<void> {
    const repFunc: ReportFunction = typeof input === 'string' ? this[input].bind(this) : input;
    const start = Date.now();
    let result = originalMethod.apply(this, args);

    if (isPromise(result)) {
      result = await result;
    }

    repFunc({
      args,
      result,
      execTime: Date.now() - start,
    });
  };
}
