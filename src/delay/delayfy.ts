export function delayfy<D, A extends unknown[], This = unknown>(
  originalMethod: (this: This, ...args: A) => D,
  delayMs: number,
): (this: This, ...args: A) => void {
  return function (this: This, ...args: A): void {
    setTimeout(() => {
      originalMethod.apply(this, args);
    }, delayMs);
  };
}
