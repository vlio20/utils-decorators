export function isPromise(obj: any): boolean {
  return !!(obj && obj.then !== undefined);
}

export function sleep(n: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, n));
}
