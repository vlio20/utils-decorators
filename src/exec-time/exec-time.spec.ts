import { execTime } from './exec-time';
import { ExactTimeReportData } from './exec-time.model';
import { sleep } from '../common/test-utils';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

describe('exec-time', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    assert.throws(() => {
      const nonValidExecTime: any = execTime();

      class T {
        @nonValidExecTime boo: string;
      }
    }, Error('@execTime is applicable only on a methods.'));
  });

  it('should make sure that the reporter is called with the correct data when decorated method is sync', () => {
    const reporter = mock.fn();

    class T {
      @execTime(reporter)
      foo(x: string): string {
        return `${x}b`;
      }
    }

    const t = new T();
    t.foo('a');

    assert.equal(reporter.mock.callCount(), 1);
    const args: ExactTimeReportData = reporter.mock.calls[0].arguments[0];
    assert.deepEqual(args.args, ['a']);
    assert.equal(args.result, 'ab');
    assert(args.execTime >= 0);
    assert(args.execTime < 10);
  });

  it('should make sure that the reporter is called with the correct data when decorated method is async', async () => {
    const reporter = mock.fn();

    class T {
      @execTime(reporter)
      async foo(x: string): Promise<string> {
        await sleep(10);
        return Promise.resolve(`${x}b`);
      }
    }

    const t = new T();
    await t.foo('a');

    assert.equal(reporter.mock.callCount(), 1);
    const args: ExactTimeReportData = reporter.mock.calls[0].arguments[0];
    assert.deepEqual(args.args, ['a']);
    assert.equal(args.result, 'ab');
    assert(args.execTime >= 8);
    assert(args.execTime < 20);
  });

  it('should make sure that the console.log is being called by default', async () => {
    const logSpy = mock.fn(console.log);
    const slog = console.log;
    console.info = logSpy;

    class T {
      @execTime()
      foo(x: string): string {
        return `${x}b`;
      }
    }

    const t = new T();
    await t.foo('a');
    assert.equal(logSpy.mock.callCount(), 1);
    const clogSpyArgs = logSpy.mock.calls[0].arguments[0];
    assert(clogSpyArgs >= 0);
    console.info = slog;
  });

  it('should make sure that the reporter is called when provided as string', async () => {
    class T {
      goo = mock.fn();

      @execTime('goo')
      async foo(x: string): Promise<string> {
        await sleep(10);
        return Promise.resolve(`${x}b`);
      }
    }

    const t = new T();
    await t.foo('a');

    assert.equal(t.goo.mock.callCount(), 1);
    const args: ExactTimeReportData = t.goo.mock.calls[0].arguments[0];
    assert.deepEqual(args.args, ['a']);
    assert.equal(args.result, 'ab');
    assert(args.execTime >= 8);
    assert(args.execTime < 20);
  });
});