import {Method} from '..';

export type CancelPreviousable<T extends any> = (target: T,
                                                 propertyName: keyof T,
                                                 descriptor: TypedPropertyDescriptor<Method<Promise<any>>>) => TypedPropertyDescriptor<Method<Promise<any>>>;
