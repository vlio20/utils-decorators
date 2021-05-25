import { AsyncMethod } from '../common/model/common.model';

export type Refreshable<T = any> = (
  target: T,
  propertyName: keyof T
) => void;

export interface RefreshableConfig<D> {
  dataProvider: AsyncMethod<D>;
  intervalMs: number;
}
