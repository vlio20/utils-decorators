import {Method} from '..';

export type ReportFunction = (data?: ExactTimeReportData) => any;

export type ExactTimeReportData = {
  args: any[];
  result: any;
  execTime: number;
}

export type ExactTimeReportable<T> = (target: T,
                                propertyName: keyof T,
                                descriptor: TypedPropertyDescriptor<Method<any>>) => TypedPropertyDescriptor<Method<any>>;
