import { sleep } from '../common/utils/utils';
import { OnRetry, RetryInput, RetryInputConfig } from './retry.model';

const DEFAULT_DELAY = 1000;

function getRetriesArray<T>(input: RetryInput<T>): number[] {
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

function getOnRetry<T>(input: RetryInput<T>, context: T): OnRetry | undefined {
  if (typeof input === 'object') {
    const { onRetry } = (input as RetryInputConfig<T>);
    if (onRetry !== undefined && typeof onRetry !== 'function') {
      return (context[onRetry] as OnRetry).bind(context);
    }

    return onRetry;
  }

  return undefined;
}

async function exec<D, A extends unknown[]>(
  this: unknown,
  originalMethod: (...x: A) => Promise<D>,
  args: A,
  retriesArr: number[],
  callsMadeSoFar: number,
  onRetry: OnRetry | undefined,
): Promise<D> {
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

export function retryfy<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => Promise<D>, input: RetryInput<NoInfer<T>>,
): (this: T, ...args: A) => Promise<D> {
  const retriesArray = getRetriesArray(input);

  return function (this: T, ...args: A): Promise<D> {
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
