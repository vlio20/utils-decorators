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
    const config = input as RetryInputConfig;

    if (config.retries && config.delaysArray) {
      throw new Error('You can not provide both retries and delaysArray');
    }

    if (config.delaysArray) {
      return config.delaysArray;
    }

    return Array(input.retries).fill(1).map(() => input.delay ?? 1000);
  }

  throw new Error('invalid input');
}

function getOnRetry(input: RetryInput, context: any): OnRetry {
  if (typeof input === 'object') {
    if (typeof (input as RetryInputConfig).onRetry === 'string') {
      return context[(input as RetryInputConfig).onRetry as string].bind(context);
    }

    return (input as RetryInputConfig).onRetry as OnRetry;
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

export function retryfy<D = any>(originalMethod: AsyncMethod<D>, input: RetryInput): AsyncMethod<D> {
  const retriesArray = getRetriesArray(input);

  return function (...args: any[]): Promise<any> {
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
