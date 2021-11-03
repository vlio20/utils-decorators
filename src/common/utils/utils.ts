export function isPromise(obj: any): obj is Promise<any> {
  return !!(obj && obj.then !== undefined);
}

export function sleep(n: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, n));
}
