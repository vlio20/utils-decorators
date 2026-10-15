export function throttlify<D, A extends unknown[], This = unknown>(
  originalMethod: (this: This, ...args: A) => D,
  delayMs: number,
): (this: This, ...args: A) => void {
  let throttling = false;
  return function (this: This, ...args: A): void {
    if (!throttling) {
      throttling = true;
      originalMethod.apply(this, args);

      setTimeout(() => {
        throttling = false;
      }, delayMs);
    }
  };
}
