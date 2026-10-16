export type Refreshable<T = object, D = unknown> = <Target extends T>(
  target: Target,
  propertyName: {
    [K in keyof Target]-?: D | undefined extends Target[K] ? K : never;
  }[keyof Target],
) => void;

export interface RefreshableConfig<D> {
  dataProvider: (this: void) => Promise<D>;
  intervalMs: number;
}
