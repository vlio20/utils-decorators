import { on } from 'cluster';
import { AsyncMethod } from '../common/model/common.model';
import { OnRetry, RetryInput, RetryInputConfig } from './retry.model';
import { sleep } from '../common/utils/utils';

function getRetriesArray(input: RetryInput): number[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (!Number.isNaN(input as number) && Number.isInteger(input as number)) {
    return Array(input as number).fill(1).map(() => 1000);
  }

  if (typeof input === 'object') {
    return Array(input.retries).fill(1).map(() => input.delay);
  }

  throw new Error('invalid input');
}

async function exec(
  originalMethod: (...x: any[]) => any,
  args: any[],
  retriesArr: number[],
  retries = 0,
  onRetry?: OnRetry,
): Promise<any> {
  try {
    const res = await originalMethod(...args);

    return res;
  } catch (e) {
    if (retries < retriesArr.length) {
      if (onRetry) {
        onRetry(e, retries);
      }

      await sleep(retriesArr[retries]);

      return exec(originalMethod, args, retriesArr, retries + 1, onRetry);
    }

    throw e;
  }
}

export function retryfy<D = any>(originalMethod: AsyncMethod<D>, input: RetryInput): AsyncMethod<D> {
  const retriesArray = getRetriesArray(input);

  return function (...args: any[]): Promise<any> {
    return exec(
      originalMethod.bind(this),
      args,
      retriesArray,
      0,
      typeof input === 'object' ? (input as RetryInputConfig).onRetry : undefined,
    );
  };
}
