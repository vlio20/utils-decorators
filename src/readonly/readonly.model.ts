export type Readonlyable<T = {}> = (target: T,
                                           propertyName: keyof T,
                                           descriptor: PropertyDescriptor) => PropertyDescriptor;
