import {Method} from '..';

export type Beforable = (target: any,
                         propertyName: string,
                         descriptor: TypedPropertyDescriptor<Method<any>>) => TypedPropertyDescriptor<Method<any>>;

export interface BeforeConfig {
  func: Function | string;
  wait?: boolean;
}
