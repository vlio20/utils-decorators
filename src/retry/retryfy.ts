import { AsyncMethod } from '../common/model/common.model';
import { sleep } from '../common/utils/utils';
import { OnRetry, RetryInput, RetryInputConfig } from './retry.model';

const DEFAULT_DELAY = 1000;

function getRetriesArray(input: RetryInput): number[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (!Number.isNaN(input as number) && Number.isInteger(input as number)) {
    return Array(input as number).fill(DEFAULT_DELAY);
  }

  if (typeof input === 'object') {
    const { retries, delaysArray, delay } = input;

    if (retries && delaysArray) {
      throw new Error('You can not provide both retries and delaysArray');
    }

    if (delaysArray) {
      return delaysArray;
    }

    return Array(retries).fill(delay ?? DEFAULT_DELAY);
  }

  throw new Error('invalid input');
}

function getOnRetry(input: RetryInput, context: any): OnRetry {
  if (typeof input === 'object') {
    const { onRetry } = (input as RetryInputConfig);
    if (typeof onRetry === 'string') {
      return context[onRetry].bind(context);
    }

    return onRetry;
  }

  return undefined;
}

async function exec(
  originalMethod: (...x: any[]) => any,
  args: any[],
  retriesArr: number[],
  callsMadeSoFar: number,
  onRetry: OnRetry,
): Promise<any> {
  try {
    const res = await originalMethod.apply(this, args);

    return res;
  } catch (e) {
    if (callsMadeSoFar < retriesArr.length) {
      if (onRetry) {
        onRetry(e, callsMadeSoFar);
      }

      await sleep(retriesArr[callsMadeSoFar]);

      return exec(originalMethod, args, retriesArr, callsMadeSoFar + 1, onRetry);
    }

    throw e;
  }
}

export function retryfy<D = any, A extends any[] = any[]>(originalMethod: AsyncMethod<D, A>, input: RetryInput): AsyncMethod<D, A> {
  const retriesArray = getRetriesArray(input);

  return function (...args: A): Promise<D> {
    const onRetry = getOnRetry(input, this);

    return exec(
      originalMethod.bind(this),
      args,
      retriesArray,
      0,
      onRetry,
    );
  };
}
