import {Method} from '../common/model/common.model';
import {ExactTimeReportData, ReportFunction} from './exec-time.model';
import {isPromise} from '../common/utils/utils';

const reporter: ReportFunction = function (data: ExactTimeReportData): void {
  console.info(data.execTime);
};

export function execTimify(originalMethod: Method<void>, arg?: ReportFunction | string): Method<void> {
  const input: ReportFunction | string = arg ?? reporter;

  return async function (...args: any[]): Promise<void> {
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
