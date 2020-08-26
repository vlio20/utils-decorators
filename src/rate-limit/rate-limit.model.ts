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
