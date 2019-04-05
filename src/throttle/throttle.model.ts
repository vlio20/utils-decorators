import {Method} from '..';

export type Throttable = (target: any,
                         propertyName: string,
                         descriptor: TypedPropertyDescriptor<Method<any>>) => TypedPropertyDescriptor<Method<any>>;
