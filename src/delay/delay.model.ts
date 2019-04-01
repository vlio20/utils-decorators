import {Method} from '../common/model/common.model';

export type Delayable = (target: any,
                         propertyName: string,
                         descriptor: TypedPropertyDescriptor<Method<any>>) => TypedPropertyDescriptor<Method<any>>;
