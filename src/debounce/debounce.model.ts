import {Method} from '..';

export type Debouncable = (target: any,
                         propertyName: string,
                         descriptor: TypedPropertyDescriptor<Method<any>>) => TypedPropertyDescriptor<Method<any>>;
