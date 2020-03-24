import {Method} from '..';
import {ExactTimeReportable, ExactTimeReportData, ReportFunction} from './exec-time.model';
import {isPromise} from '../common/utils/utils';

const reporter: ReportFunction = function (data: ExactTimeReportData): void {
  console.info(data.execTime);
};

export function execTime<T = any>(arg?: ReportFunction | string): ExactTimeReportable<T> {
  if (!arg) {
    arg = reporter;
  }

  return (target: T,
          propertyName: keyof T,
          descriptor: TypedPropertyDescriptor<Method<any>>): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor.value) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]): Promise<void> {
        const repFunc: ReportFunction = typeof arg === 'string' ? this[arg].bind(this) : arg;

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

      return descriptor;
    }
    throw new Error('@execTime is applicable only on a methods.');
  };
}
