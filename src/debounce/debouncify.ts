export function debouncify<D, A extends unknown[], This = unknown>(
  originalMethod: (this: This, ...args: A) => D,
  delayMs: number,
): (this: This, ...args: A) => void {
  let handler: ReturnType<typeof setTimeout> | undefined;

  return function (this: This, ...args: A): void {
    clearTimeout(handler);

    handler = setTimeout(() => {
      originalMethod.apply(this, args);
    }, delayMs);
  };
}
