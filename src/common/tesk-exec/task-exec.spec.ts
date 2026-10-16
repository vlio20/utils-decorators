import { TaskExec } from './task-exec';

describe('utils', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Discard remaining expiry, timeout, or scheduled work without executing it.
    jest.clearAllTimers();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('should verify task executed in time - A:100, B:40 -> B, A', async () => {
    const runner = new TaskExec();
    let val = '';
    const funA = jest.fn().mockImplementation(() => {
      val += 'A';
    });
    const funB = jest.fn().mockImplementation(() => {
      val += 'B';
    });

    runner.exec(funA, 100);

    await jest.advanceTimersByTimeAsync(20);

    expect(funA).not.toHaveBeenCalled();
    runner.exec(funB, 40);

    await jest.advanceTimersByTimeAsync(20);

    expect(funA).not.toHaveBeenCalled();
    expect(funB).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(19);
    expect(funB).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);

    expect(funA).not.toHaveBeenCalled();
    expect(funB).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(39);
    expect(funA).not.toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(1);

    expect(funA).toHaveBeenCalledTimes(1);
    expect(funB).toHaveBeenCalledTimes(1);
    expect(val).toBe('BA');
  });

  it('should verify task executed in time - A:50, B:100 -> A, B', async () => {
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

    await jest.advanceTimersByTimeAsync(20);

    expect(funA).not.toHaveBeenCalled();
    expect(funB).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(50);

    expect(funA).toHaveBeenCalled();
    expect(funB).not.toHaveBeenCalled();

    await jest.advanceTimersByTimeAsync(50);

    expect(funA).toHaveBeenCalledTimes(1);
    expect(funB).toHaveBeenCalledTimes(1);
    expect(val).toBe('AB');
  });

  it('should verify task executed in time -  - A:50, B:50, C:10 -> C, A, B', async () => {
    const runner = new TaskExec();
    const funA = jest.fn();
    const funB = jest.fn();
    const funC = jest.fn();

    runner.exec(funA, 50);
    runner.exec(funB, 50);

    await jest.advanceTimersByTimeAsync(20);

    expect(funA).not.toHaveBeenCalled();
    expect(funB).not.toHaveBeenCalled();
    runner.exec(funC, 10);

    await jest.advanceTimersByTimeAsync(50);

    expect(funA).toHaveBeenCalledTimes(1);
    expect(funB).toHaveBeenCalledTimes(1);
    expect(funC).toHaveBeenCalledTimes(1);
  });
});
