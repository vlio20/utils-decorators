import { execTime } from './exec-time';
import { ExactTimeReportData } from './exec-time.model';
import { sleep } from '../common/test-utils';

describe('exec-time', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidExecTime: any = execTime();

      class T {
        @nonValidExecTime
          boo: string;
      }
    } catch (e) {
      expect('@execTime is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });

  it('should make sure that the reporter is called with the correct data when decorated method is sync', () => {
    const reporter = jest.fn();

    class T {
      @execTime(reporter)
      foo(x: string): string {
        return `${x}b`;
      }
    }

    const t = new T();
    const returned = t.foo('a');

    expect(reporter).toBeCalledTimes(1);
    const args: ExactTimeReportData = reporter.mock.calls[0][0];
    expect(args.args).toEqual(['a']);
    expect(returned).toEqual('ab');
    expect(args.result).toEqual('ab');
    expect(args.execTime).toBeGreaterThanOrEqual(0);
    expect(args.execTime).toBeLessThan(10);
  });

  it('should make sure that the reporter is called with the correct data when decorated method is async', async () => {
    const reporter = jest.fn();

    class T {
      @execTime(reporter)
      async foo(x: string): Promise<string> {
        await sleep(10);

        return Promise.resolve(`${x}b`);
      }
    }

    const t = new T();
    const returned = await t.foo('a');

    expect(reporter).toBeCalledTimes(1);
    const args: ExactTimeReportData = reporter.mock.calls[0][0];
    expect(args.args).toEqual(['a']);
    expect(returned).toEqual('ab');
    expect(args.result).toEqual('ab');
    expect(args.execTime).toBeGreaterThanOrEqual(8);
    expect(args.execTime).toBeLessThan(20);
  });

  it('should make sure that the console.log is being called by default', async () => {
    const logSpy = jest.spyOn(global.console, 'info');

    class T {
      @execTime()
      foo(x: string): string {
        return `${x}b`;
      }
    }

    const t = new T();
    const returned = await t.foo('a');
    expect(logSpy).toBeCalledTimes(1);
    const clogSpyArgs = logSpy.mock.calls[0][0];
    expect(clogSpyArgs).toBeGreaterThanOrEqual(0);
    expect(returned).toEqual('ab');
    logSpy.mockRestore();
  });

  it('should make sure that the reporter is called when provided as string', async () => {
    class T {
      goo = jest.fn();

      @execTime('goo')
      async foo(x: string): Promise<string> {
        await sleep(10);

        return Promise.resolve(`${x}b`);
      }
    }

    const t = new T();
    const returned = await t.foo('a');

    expect(t.goo).toBeCalledTimes(1);
    const args: ExactTimeReportData = t.goo.mock.calls[0][0];
    expect(args.args).toEqual(['a']);
    expect(returned).toEqual('ab');
    expect(args.result).toEqual('ab');
    expect(args.execTime).toBeGreaterThanOrEqual(8);
    expect(args.execTime).toBeLessThan(20);
  });
});
