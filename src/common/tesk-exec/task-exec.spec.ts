import {TaskExec} from './task-exec';
import {sleep} from '../test-utils';

describe('utils', () => {
  it('should verify task executed in time - A:40, B:20 -> B, A', async (done) => {
    const runner = new TaskExec();
    let val = '';
    const funA = jest.fn().mockImplementation(() => {
      val += 'A';
    });
    const funB = jest.fn().mockImplementation(() => {
      val += 'B';
    });

    runner.exec(funA, 50);

    await sleep(10);

    expect(funA).not.toBeCalled();
    runner.exec(funB, 20);

    await sleep(10);

    expect(funA).not.toBeCalled();
    expect(funB).not.toBeCalled();

    await sleep(20);

    expect(funA).not.toBeCalled();
    expect(funB).toBeCalledTimes(1);

    await sleep(50);

    expect(funA).toBeCalledTimes(1);
    expect(funB).toBeCalledTimes(1);
    expect(val).toBe('BA');
    done();
  });

  it('should verify task executed in time - A:20, B:40 -> A, B', async (done) => {
    const runner = new TaskExec();
    let val = '';
    const funA = jest.fn().mockImplementation(() => {
      val += 'A';
    });
    const funB = jest.fn().mockImplementation(() => {
      val += 'B';
    });

    runner.exec(funA, 50);
    runner.exec(funB, 100);

    await sleep(20);

    expect(funA).not.toBeCalled();
    expect(funB).not.toBeCalled();

    await sleep(50);

    expect(funA).toBeCalled();
    expect(funB).not.toBeCalled();

    await sleep(50);

    expect(funA).toBeCalledTimes(1);
    expect(funB).toBeCalledTimes(1);
    expect(val).toBe('AB');
    done();
  });

  it('should verify task executed in time -  - A:20, B:20, C:10 -> A, B, C', async (done) => {
    const runner = new TaskExec();
    const funA = jest.fn();
    const funB = jest.fn();
    const funC = jest.fn();

    runner.exec(funA, 50);
    runner.exec(funB, 50);

    await sleep(20);

    expect(funA).not.toBeCalled();
    expect(funB).not.toBeCalled();
    runner.exec(funC, 10);

    await sleep(50);

    expect(funA).toBeCalledTimes(1);
    expect(funB).toBeCalledTimes(1);
    expect(funC).toBeCalledTimes(1);
    done();
  });
});
