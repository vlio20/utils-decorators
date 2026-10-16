export interface Readonlyable<T = object> {
  (target: T, propertyName: string | symbol): void;
  <Value>(
    target: T,
    propertyName: string | symbol,
    descriptor: TypedPropertyDescriptor<Value>,
  ): TypedPropertyDescriptor<Value>;
}
