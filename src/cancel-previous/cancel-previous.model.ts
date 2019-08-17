import {Method} from '..';

export type CancelPreviousable<T, D> = (target: T,
                                propertyName: keyof T,
                                descriptor: TypedPropertyDescriptor<Method<Promise<D>>>) => TypedPropertyDescriptor<Method<Promise<D>>>;
