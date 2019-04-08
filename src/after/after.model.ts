import {Method} from '..';

export type Afterable = (target: any,
                         propertyName: string,
                         descriptor: TypedPropertyDescriptor<Method<any>>) => TypedPropertyDescriptor<Method<any>>;

export interface AfterConfig {
  func: Function | string;
  wait?: boolean;
}
