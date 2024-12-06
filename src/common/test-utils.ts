import assert from 'node:assert';
import { Mock } from 'node:test';

export function sleep(n: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, n));
}

type Callable = (...args: any) => any;

type Call<T extends Callable> = [Parameters<T>, ReturnType<T>] | [Parameters<T>];

export function assertCalls<T extends Mock<Callable>>(func: T, expectedCalls: Call<T>[]): void {
  assert.equal( func.mock.calls.length, expectedCalls.length);

  func.mock.calls.forEach((call: any, i: number) => {
    assert.deepEqual(call.arguments, expectedCalls[i][0]);
    if (expectedCalls[i].length === 1) {
      return;
    }

    assert.deepEqual(call.result, expectedCalls[i][1]);
  });
}

export function assertNotCalled<T extends Mock<Callable>>(func: T): void {
  assert.equal(0, func.mock.calls.length);
}