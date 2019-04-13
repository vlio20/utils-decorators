export interface AfterConfig<T> {
  func: Function | keyof T;
  wait?: boolean;
}
