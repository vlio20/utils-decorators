import {Method} from '..';

export type Refreshable<T = any> = (target: T,
                                    propertyName: keyof T) => void;

export interface RefreshableConfig<D> {
  dataProvider: Method<D> | Method<Promise<D>>;
  intervalMs: number;
}
