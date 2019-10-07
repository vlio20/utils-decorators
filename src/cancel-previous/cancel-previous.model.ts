import {Method} from '..';

export type CancelPreviousable<T = any> = (target: T,
                                                 propertyName: keyof T,
                                                 descriptor: TypedPropertyDescriptor<Method<Promise<any>>>) => TypedPropertyDescriptor<Method<Promise<any>>>;
