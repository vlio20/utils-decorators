import { RateLimitCounter } from './rate-limit.model';

export class SimpleRateLimitCounter implements RateLimitCounter {
  constructor(private readonly counterMap = new Map<string, number>()) {
  }

  getCount(key: string): number {
    return this.counterMap.get(key) ?? 0;
  }

  inc(key: string): void {
    if (!this.counterMap.has(key)) {
      this.counterMap.set(key, 0);
    }

    this.counterMap.set(key, this.getCount(key) + 1);
  }

  dec(key: string): void {
    const currentCount = this.getCount(key);

    if (currentCount === 1) {
      this.counterMap.delete(key);
    } else {
      this.counterMap.set(key, currentCount - 1);
    }
  }
}
