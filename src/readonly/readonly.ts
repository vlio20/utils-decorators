export function readonly<T = any>(): any {
  return (target: T, propertyKey: keyof T): void => {
    let value = target[propertyKey];

    const getter = () => value;
    const setter = (newValue: any) => {
      if (value !== undefined) {
        throw new Error(`Cannot assign to read only property '${propertyKey as string}' of object '#<${target.constructor.name}>'`);
      }

      value = newValue;
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
    });
  };
}