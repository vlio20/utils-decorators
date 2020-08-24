export interface RateLimitConfigs<T = any> {
  timeSpanMs: number;
  allowedCalls: number;
  keyResolver?: ((...args: any[]) => string) | keyof T;
  rateLimitCounter?: RateLimitCounter;
  rateLimitAsyncCounter?: RateLimitAsyncCounter;
}

export interface RateLimitCounter {
  inc: (key: string) => void;
  dec: (key: string) => void;
  getCount: (key: string) => number;
}

export interface RateLimitAsyncCounter {
  inc: (key: string) => Promise<void>;
  dec: (key: string) => Promise<void>;
  getCount: (key: string) => Promise<number>;
}

export class SimpleRateLimitCounter implements RateLimitCounter {
  private counterMap = new Map<string, number>();

  getCount(key: string): number {
    return this.counterMap.get(key) ?? 0;
  }

  inc(key: string): void {
    if (!this.counterMap.has(key)) {
      this.counterMap.set(key, 0);
    }

    this.counterMap.set(key, this.counterMap.get(key) + 1);
  }

  dec(key: string): void {
    const currentCount = this.counterMap.get(key);

    if (currentCount === 1) {
      this.counterMap.delete(key);
    } else {
      this.counterMap.set(key, currentCount - 1);
    }
  }
}
