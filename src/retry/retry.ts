import {AsyncMethod} from '../common/model/common.model';
import {Retryable, RetryInput} from './retry.model';
import {sleep} from '../common/utils/utils';

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
): Promise<any> {
  try {
    const res = await originalMethod(...args);

    return res;
  } catch (e) {
    if (retries < retriesArr.length) {
      await sleep(retriesArr[retries]);

      return exec(originalMethod, args, retriesArr, retries + 1);
    }

    throw e;
  }
}

export function retry<T = any>(input: RetryInput): Retryable<T> {
  const retriesArray = getRetriesArray(input);

  return (
    target: T,
    propertyName: keyof T,
    descriptor: TypedPropertyDescriptor<AsyncMethod<any>>,
  ): TypedPropertyDescriptor<AsyncMethod<any>> => {
    if (descriptor.value) {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: any[]): Promise<any> {
        return exec(
          originalMethod.bind(this),
          args,
          retriesArray,
        );
      };

      return descriptor;
    }

    throw new Error('@retry is applicable only on a methods.');
  };
}
