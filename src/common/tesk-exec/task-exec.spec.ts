import { TaskExec } from './task-exec';
import { sleep } from '../test-utils';
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';

describe('utils', () => {
  it('should verify task executed in time - A:40, B:20 -> B, A', async () => {
    const runner = new TaskExec();
    let val = '';
    const funA = () => { val += 'A'; };
    const funB = () => { val += 'B'; };

    runner.exec(funA, 100);

    await sleep(20);

    assert.strictEqual(val, '');
    runner.exec(funB, 40);

    await sleep(20);

    assert.strictEqual(val, '');

    await sleep(40);

    assert.strictEqual(val, 'B');

    await sleep(100);

    assert.strictEqual(val, 'BA');
  });

  it('should verify task executed in time - A:20, B:40 -> A, B', async () => {
    const runner = new TaskExec();
    let val = '';
    const funA = () => { val += 'A'; };
    const funB = () => { val += 'B'; };

    runner.exec(funA, 50);
    runner.exec(funB, 100);

    await sleep(20);

    assert.strictEqual(val, '');

    await sleep(50);

    assert.strictEqual(val, 'A');

    await sleep(50);

    assert.strictEqual(val, 'AB');
  });

  it('should verify task executed in time -  - A:20, B:20, C:10 -> A, B, C', async () => {
    const runner = new TaskExec();
    const funA = mock.fn();
    const funB = mock.fn();
    const funC = mock.fn();

    runner.exec(funA, 50);
    runner.exec(funB, 50);

    await sleep(20);

    assert.equal(funA.mock.callCount(), 0);
    assert.equal(funB.mock.callCount(), 0);
    runner.exec(funC, 10);

    await sleep(50);

    assert.equal(funA.mock.callCount(), 1);
    assert.equal(funB.mock.callCount(), 1);
    assert.equal(funC.mock.callCount(), 1);
  });
});