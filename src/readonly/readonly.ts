export function readonly<T extends any>(target: T, key: keyof T): void {
  Object.defineProperty(target, key, {
    writable: false
  });
}
