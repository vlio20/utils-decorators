import { AsyncMethod } from '../common/model/common.model';
import { TaskExec } from '../common/tesk-exec/task-exec';
import { RateLimitAsyncCounter, RateLimitConfigs, RateLimitCounter } from './rate-limit.model';
import { SimpleRateLimitCounter } from './simple-rate-limit-counter';

type ResolvedRateLimitConfigs<T, A extends unknown[]> = Omit<RateLimitConfigs<T, A>, 'rateLimitCounter' | 'rateLimitAsyncCounter'> & {
  rateLimitCounter: RateLimitCounter;
  rateLimitAsyncCounter?: RateLimitAsyncCounter;
  exceedHandler: (...args: A) => void;
};

async function handleAsyncRateLimit<T, D, A extends unknown[]>(
  target: T,
  resolvedConfig: ResolvedRateLimitConfigs<T, A> & { rateLimitAsyncCounter: RateLimitAsyncCounter },
  key: string,
  taskExec: TaskExec,
  originalMethod: AsyncMethod<D, A>,
  args: A,
): Promise<D> {
  const rateLimitCounter = resolvedConfig.rateLimitAsyncCounter;
  const currentCount = await rateLimitCounter.getCount(key);

  if (currentCount >= resolvedConfig.allowedCalls) {
    resolvedConfig.exceedHandler(...args);
  }

  await rateLimitCounter.inc(key);

  taskExec.exec(() => {
    rateLimitCounter.dec(key);
  }, resolvedConfig.timeSpanMs);

  return originalMethod.apply(target, args);
}

function handleRateLimit<T, D, A extends unknown[]>(
  target: T,
  resolvedConfig: ResolvedRateLimitConfigs<T, A>,
  key: string,
  taskExec: TaskExec,
  originalMethod: (...x: A) => D,
  args: A,
): D {
  const { rateLimitCounter } = resolvedConfig;
  const currentCount = rateLimitCounter.getCount(key);

  if (currentCount >= resolvedConfig.allowedCalls) {
    resolvedConfig.exceedHandler(...args);
  }

  rateLimitCounter.inc(key);

  taskExec.exec(() => {
    rateLimitCounter.dec(key);
  }, resolvedConfig.timeSpanMs);

  return originalMethod.apply(target, args);
}

export function rateLimitify<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => D,
  config: NoInfer<RateLimitConfigs<T, A>> & { rateLimitAsyncCounter: RateLimitAsyncCounter },
): (this: T, ...args: A) => Promise<Awaited<D>>;
export function rateLimitify<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => D,
  config: NoInfer<RateLimitConfigs<T, A>> & { rateLimitAsyncCounter?: undefined },
): (this: T, ...args: A) => D;
export function rateLimitify<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => D,
  config: NoInfer<RateLimitConfigs<T, A>>,
): (this: T, ...args: A) => D | Promise<Awaited<D>>;
export function rateLimitify<D, A extends unknown[], T>(
  originalMethod: (this: T, ...args: A) => D,
  config: RateLimitConfigs<T, A>,
): (this: T, ...args: A) => D | Promise<Awaited<D>> {
  if (config.rateLimitAsyncCounter && config.rateLimitCounter) {
    throw new Error('You cant provide both rateLimitAsyncCounter and rateLimitCounter.');
  }

  const taskExec = new TaskExec();
  const resolvedConfig = {
    ...config,
    rateLimitCounter: config.rateLimitCounter ?? new SimpleRateLimitCounter(),
    exceedHandler: config.exceedHandler ?? (() => {
      throw new Error('You have acceded the amount of allowed calls');
    }),
    keyResolver: config.keyResolver ?? (() => '__rateLimit__'),
  };

  return function (this: T, ...args: A): D | Promise<Awaited<D>> {
    const keyResolver = typeof resolvedConfig.keyResolver === 'function'
      ? resolvedConfig.keyResolver.bind(this) : (this[resolvedConfig.keyResolver] as (...args: A) => string).bind(this);
    const key = keyResolver(...args);

    if (resolvedConfig.rateLimitAsyncCounter) {
      return handleAsyncRateLimit<T, Awaited<D>, A>(
        this, { ...resolvedConfig, rateLimitAsyncCounter: resolvedConfig.rateLimitAsyncCounter },
        key, taskExec, originalMethod as AsyncMethod<Awaited<D>, A>, args,
      );
    }

    return handleRateLimit<T, D, A>(this, resolvedConfig, key, taskExec, originalMethod, args);
  };
}
