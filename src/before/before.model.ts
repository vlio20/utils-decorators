export interface BeforeConfig<T> {
  func: Function | keyof T;
  wait?: boolean;
}
