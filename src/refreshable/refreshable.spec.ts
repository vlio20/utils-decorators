import { refreshable } from './refreshable';
import { sleep } from '../common/test-utils';
import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert';

describe('refreshable', () => {
  const originalSetInterval = global.setInterval;
  const unrefMock = mock.fn();

  function useFakeSetInterval() {
    global.setInterval = <any>mock.fn(() => ({ unref: unrefMock }));
  }

  afterEach(() => {
    global.setInterval = originalSetInterval;
  });

  it('should call unref on setInterval', async () => {
    useFakeSetInterval();
    const foo = refreshable<any, number>({
      dataProvider: () => Promise.resolve(0),
      intervalMs: 50,
    });
    const t = { prop: 0 } as { prop: number };
    foo(t, 'prop');
    await sleep(10);
    assert.equal(unrefMock.mock.callCount(), 1);
  });

  it('validate unref is not a function, the refreshable logic still works', async () => {
    const dataProviderMock = mock.fn(() => Promise.resolve(0));
    global.setInterval = <any>mock.fn(() => ({ unref: 'string' }));
    const foo = refreshable<any, number>({
      dataProvider: dataProviderMock,
      intervalMs: 50,
    });
    const t = { prop: 0 } as { prop: number };
    foo(t, 'prop');
    await sleep(10);
    assert.equal(dataProviderMock.mock.callCount(), 1);
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

    assert.equal(t.prop, 0);
    assert.equal(t.proop, 0);

    await sleep(60);

    assert.equal(t.prop, 1);
    assert.equal(t.proop, 1);
    t.prop = null;
    t.proop = 100;

    await sleep(50);

    assert.equal(t.prop, 1);
    assert.equal(t.proop, 2);
  });
});
