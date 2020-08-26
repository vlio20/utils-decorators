export interface BeforeConfig<T> {
  func: ((...args: any[]) => any) | keyof T;
  wait?: boolean;
}
