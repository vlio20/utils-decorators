export function isPromise(obj: any): boolean {
  return !!(obj && (obj instanceof Promise || obj.then !== undefined));
}
