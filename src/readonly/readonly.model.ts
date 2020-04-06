export type Readonlyable<T = any> = (
  target: T,
  propertyName: keyof T,
  descriptor: PropertyDescriptor
) => PropertyDescriptor;
