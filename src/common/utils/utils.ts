export function isPromise(obj: any): boolean {
  return !!(obj && obj.then !== undefined);
}
