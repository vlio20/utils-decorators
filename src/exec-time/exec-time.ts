import { Method } from '../common/model/common.model';
import { ExactTimeReportable, ReportFunction } from './exec-time.model';
import { execTimify } from './exec-timify';

export function execTime<T = any>(arg?: ReportFunction | string): ExactTimeReportable<T> {
  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<Method<any>>,
  ): TypedPropertyDescriptor<Method<any>> => {
    if (descriptor && descriptor.value) {
      descriptor.value = execTimify(descriptor.value, arg);

      return descriptor;
    }

    throw new Error('@execTime is applicable only on a methods.');
  };
}
