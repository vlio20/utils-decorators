export type Refreshable<T> = (target: T,
                              propertyName: keyof T) => void;
