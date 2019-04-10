export function readonly<T>(target: T, key: keyof T): void {
  Object.defineProperty(target, key, {
    writable: false
  });
}
