import { AsyncMethod, Method } from '../common/model/common.model';
import { TaskExec } from '../common/tesk-exec/task-exec';
import { RateLimitConfigs } from './rate-limit.model';
import { SimpleRateLimitCounter } from './simple-rate-limit-counter';

async function handleAsyncRateLimit<T, D, A extends any[]>(
  target: T,
  resolvedConfig: RateLimitConfigs,
  key: string,
  taskExec: TaskExec,
  originalMethod: AsyncMethod<D, A>,
  args: A,
): Promise<D> {
  const rateLimitCounter = resolvedConfig.rateLimitAsyncCounter;
  const currentCount = await rateLimitCounter.getCount(key);

  if (currentCount >= resolvedConfig.allowedCalls) {
    resolvedConfig.exceedHandler();
  }

  await rateLimitCounter.inc(key);

  taskExec.exec(() => {
    rateLimitCounter.dec(key);
  }, resolvedConfig.timeSpanMs);

  return originalMethod.apply(target, args);
}

function handleRateLimit<T, D, A extends any[]>(
  target: T,
  resolvedConfig: RateLimitConfigs,
  key: string,
  taskExec: TaskExec,
  originalMethod: (...x: A) => D,
  args: A,
): Promise<D> {
  const { rateLimitCounter } = resolvedConfig;
  const currentCount = rateLimitCounter.getCount(key);

  if (currentCount >= resolvedConfig.allowedCalls) {
    resolvedConfig.exceedHandler();
  }

  rateLimitCounter.inc(key);

  taskExec.exec(() => {
    rateLimitCounter.dec(key);
  }, resolvedConfig.timeSpanMs);

  return originalMethod.apply(target, args);
}

export function rateLimitify<D = any, A extends any[] = any[]>(
  originalMethod: Method<D, A> | AsyncMethod<D, A>,
  config: RateLimitConfigs,
): Method<D, A> {
  if (config.rateLimitAsyncCounter && config.rateLimitCounter) {
    throw new Error('You cant provide both rateLimitAsyncCounter and rateLimitCounter.');
  }

  const taskExec = new TaskExec();
  const resolvedConfig: RateLimitConfigs = {
    rateLimitCounter: new SimpleRateLimitCounter(),
    exceedHandler: () => {
      throw new Error('You have acceded the amount of allowed calls');
    },
    keyResolver: () => '__rateLimit__',
    ...config,
  };

  return function (...args: A): D | Promise<D> {
    const keyResolver: (...x: A) => string = typeof resolvedConfig.keyResolver === 'string'
      ? this[resolvedConfig.keyResolver] : (resolvedConfig.keyResolver as (...x: A) => any).bind(this);
    const key = keyResolver(...args);

    if (resolvedConfig.rateLimitAsyncCounter) {
      return handleAsyncRateLimit<any, D, A>(this, resolvedConfig, key, taskExec, originalMethod as AsyncMethod<D>, args);
    }

    return handleRateLimit<any, D, A>(this, resolvedConfig, key, taskExec, originalMethod as Method<D>, args);
  } as Method<D>;
}
