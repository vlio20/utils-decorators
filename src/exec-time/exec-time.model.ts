import {Method} from '../common/model/common.model';

export type ReportFunction = (data?: ExactTimeReportData) => any;

export interface ExactTimeReportData {
  args: any[];
  result: any;
  execTime: number;
}

export type ExactTimeReportable<T> = (
  target: T,
  propertyName: keyof T,
  descriptor: TypedPropertyDescriptor<Method<any>>
) => TypedPropertyDescriptor<Method<any>>;
