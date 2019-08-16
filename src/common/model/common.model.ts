export type Method<D> = (...args: any[]) => D;
export type Decorator<T> = (target: T,
                            propertyName: keyof T,
                            descriptor: TypedPropertyDescriptor<Method<any>>) => TypedPropertyDescriptor<Method<any>>;
