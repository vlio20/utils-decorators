import { refreshable } from './refreshable';
import { sleep } from '../common/test-utils';

describe('refreshable', () => {
  const originalSetInterval = global.setInterval;
  const unrefMock = jest.fn();

  function useFakeSetInterval() {
    global.setInterval = <any>jest.fn(() => ({ unref: unrefMock }));
  }

  function restoreSetInterval() {
    global.setInterval = originalSetInterval;
  }

  afterEach(restoreSetInterval);

  it('should call unref on setInterval', async () => {
    useFakeSetInterval();
    const foo = refreshable<any, number>({
      dataProvider: () => Promise.resolve(0),
      intervalMs: 50,
    });
    const t = { prop: 0 } as { prop: number };
    foo(t, 'prop');
    await sleep(10);
    expect(unrefMock).toHaveBeenCalled();
  });

  it('should populate refreshable property', async () => {
    let fooCtr = 0;
    let gooCtr = 0;

    const foo = async (): Promise<number> => {
      const tmp = gooCtr;
      fooCtr += 1;

      return tmp;
    };

    const goo = async (): Promise<number> => {
      const tmp = gooCtr;
      gooCtr += 1;

      return tmp;
    };

    const fooDec = refreshable<any, number>({
      dataProvider: foo,
      intervalMs: 50,
    });

    const gooDec = refreshable<any, number>({
      dataProvider: goo,
      intervalMs: 50,
    });

    const t = { prop: 9, proop: 4 } as { prop: number; proop: number };
    fooDec(t, 'prop');
    gooDec(t, 'proop');

    await sleep(10);

    expect(t.prop).toBe(0);
    expect(t.proop).toBe(0);

    await sleep(60);

    expect(t.prop).toBe(1);
    expect(t.proop).toBe(1);
    t.prop = null;
    t.proop = 100;

    await sleep(50);

    expect(t.prop).toBe(1);
    expect(t.proop).toBe(2);
  });
});
