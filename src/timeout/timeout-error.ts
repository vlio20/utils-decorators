export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`timeout occurred after ${ms}`);

    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
