import { Decorator } from '../common/model/common.model';

export type ReportFunction<D = unknown, A extends unknown[] = unknown[]> = (data: ExactTimeReportData<D, A>) => void;
export interface ExactTimeReportData<D = unknown, A extends unknown[] = unknown[]> {
  args: A;
  result: D;
  execTime: number;
}
export type ExactTimeReportable<T = unknown> = Decorator<T>;
