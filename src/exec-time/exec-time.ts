import { AnyMethod, CompatibleKeys, NormalizedReturnCompatible } from '../common/model/common.model';
import { ExactTimeReportData, ReportFunction } from './exec-time.model';
import { execTimify } from './exec-timify';

type ContextualReporter = { report(data: ExactTimeReportData): void }['report'];
type ExecTimeDecorator<C> = <T, F extends AnyMethod>(
  target: T,
  propertyName: string | symbol,
  descriptor: TypedPropertyDescriptor<F> & NormalizedReturnCompatible<F> & ([C] extends [
    undefined | ReportFunction<Awaited<ReturnType<F>>, Parameters<F>>
    | CompatibleKeys<T, [ExactTimeReportData<Awaited<ReturnType<F>>, Parameters<F>>]>
  ] ? unknown : never),
) => TypedPropertyDescriptor<F>;

export function execTime(): ExecTimeDecorator<undefined>;
export function execTime<const C extends ContextualReporter | PropertyKey | undefined>(arg: C): ExecTimeDecorator<C>;
export function execTime<const C extends ContextualReporter | PropertyKey | undefined>(arg?: C): ExecTimeDecorator<C> {
  return (target, propertyName, descriptor) => {
    if (descriptor?.value) {
      descriptor.value = execTimify(descriptor.value, arg as ReportFunction<any, any>) as typeof descriptor.value;

      return descriptor;
    }

    throw new Error('@execTime is applicable only on a methods.');
  };
}
