import { execTimify } from './exec-timify';
import { execTime } from './exec-time';
import { ExactTimeReportData } from './exec-time.model';
import { sleep } from '../common/test-utils';

describe('exec-time', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidExecTime: any = execTime();

      class T {
        @nonValidExecTime
          boo!: string;
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

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
    t.foo('a');

    expect(reporter).toHaveBeenCalledTimes(1);
    const args: ExactTimeReportData = reporter.mock.calls[0][0];
    expect(args.args).toEqual(['a']);
    expect(args.result).toEqual('ab');
    expect(args.execTime).toBe(0);
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
    const pending = t.foo('a');
    expect(reporter).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(10);
    await expect(pending).resolves.toBe('ab');

    expect(reporter).toHaveBeenCalledTimes(1);
    const args: ExactTimeReportData = reporter.mock.calls[0][0];
    expect(args.args).toEqual(['a']);
    expect(args.result).toEqual('ab');
    expect(args.execTime).toBe(10);
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
    await t.foo('a');
    expect(logSpy).toHaveBeenCalledTimes(1);
    const clogSpyArgs = logSpy.mock.calls[0][0];
    expect(clogSpyArgs).toBeGreaterThanOrEqual(0);
    logSpy.mockRestore();
  });

  it('should make sure that the reporter is called when provided as sting', async () => {
    class T {
      goo = jest.fn();

      @execTime('goo')
      async foo(x: string): Promise<string> {
        await sleep(10);

        return Promise.resolve(`${x}b`);
      }
    }

    const t = new T();
    const pending = t.foo('a');
    expect(t.goo).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(10);
    await expect(pending).resolves.toBe('ab');

    expect(t.goo).toHaveBeenCalledTimes(1);
    const args: ExactTimeReportData = t.goo.mock.calls[0][0];
    expect(args.args).toEqual(['a']);
    expect(args.result).toEqual('ab');
    expect(args.execTime).toBe(10);
  });
});

describe('execTimify return values', () => {
  it('returns and reports the synchronous result', () => {
    const report = jest.fn();
    expect(execTimify(() => 42, report)()).toBe(42);
    expect(report).toHaveBeenCalledWith({ args: [], result: 42, execTime: expect.any(Number) });
  });

  it('returns and reports the resolved async result', async () => {
    const report = jest.fn();
    await expect(execTimify(async () => 42, report)()).resolves.toBe(42);
    expect(report).toHaveBeenCalledWith({ args: [], result: 42, execTime: expect.any(Number) });
  });
});
