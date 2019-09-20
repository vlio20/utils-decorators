export type Readonlyable<T extends any> = (target: T,
                                           propertyName: keyof T,
                                           descriptor: PropertyDescriptor) => PropertyDescriptor;
