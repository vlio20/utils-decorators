import { LeakyBucketOptions } from './leaky-bucket.model';

export class LeakyBucket {
  private readonly intervalMs: number;

  private readonly maxQueueSize: number;

  private readonly callsToRun = new Map<object, () => void>();

  private nextCallTime = 0;

  private draining = false;

  private timer?: ReturnType<typeof setTimeout>;

  constructor(config: LeakyBucketOptions) {
    const { timeSpanMs, allowedCalls, maxQueueSize = 1000 } = config;

    if (!Number.isFinite(timeSpanMs) || timeSpanMs <= 0) {
      throw new RangeError('timeSpanMs must be a positive finite number.');
    }

    if (!Number.isSafeInteger(allowedCalls) || allowedCalls <= 0) {
      throw new RangeError('allowedCalls must be a positive safe integer.');
    }

    if (!Number.isSafeInteger(maxQueueSize) || maxQueueSize < 0) {
      throw new RangeError('maxQueueSize must be a non-negative safe integer.');
    }

    this.intervalMs = timeSpanMs / allowedCalls;

    if (this.intervalMs === 0) {
      throw new RangeError('timeSpanMs / allowedCalls must be greater than zero.');
    }

    this.maxQueueSize = maxQueueSize;
  }

  exec<D>(task: () => Promise<D>, signal?: AbortSignal): Promise<D> {
    return new Promise<D>((resolve, reject) => {
      if (signal?.aborted) {
        reject(signal.reason);

        return;
      }

      const canStart = this.callsToRun.size === 0 && performance.now() >= this.nextCallTime;

      if (!canStart && this.callsToRun.size >= this.maxQueueSize) {
        reject(new Error('Leaky bucket queue is full.'));

        return;
      }

      const key = {};
      const cancel = () => {
        this.callsToRun.delete(key);
        signal!.removeEventListener('abort', cancel);
        reject(signal!.reason);

        if (this.callsToRun.size === 0) {
          clearTimeout(this.timer);
          this.timer = undefined;
        }
      };

      this.callsToRun.set(key, () => {
        signal?.removeEventListener('abort', cancel);

        try {
          resolve(task());
        } catch (error) {
          reject(error);
        }
      });
      signal?.addEventListener('abort', cancel);
      this.tryCall();
    });
  }

  private tryCall(): void {
    if (this.timer !== undefined || this.draining) {
      return;
    }

    this.draining = true;

    try {
      while (this.callsToRun.size > 0) {
        const remainingMs = this.nextCallTime - performance.now();

        if (remainingMs > 0) {
          this.timer = setTimeout(() => {
            this.timer = undefined;
            this.tryCall();
          }, Math.min(Math.ceil(remainingMs), 2147483647));

          return;
        }

        const [key, run] = this.callsToRun.entries().next().value!;
        this.callsToRun.delete(key);
        this.nextCallTime = performance.now() + this.intervalMs;
        run();
      }
    } finally {
      this.draining = false;
    }
  }
}
