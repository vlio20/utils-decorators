/** Scope decorator-created wrapper state to each receiver. */
export function perInstance<F extends (this: any, ...args: any[]) => any>(create: () => F): F {
  const methods = new WeakMap<object, F>();
  // Keep creation-time validation, then reserve this wrapper for the first receiver.
  let firstMethod: F | undefined = create();
  let unboundMethod: F | undefined;

  return function (this: unknown, ...args: Parameters<F>): ReturnType<F> {
    const receiver = (typeof this === 'object' && this !== null) || typeof this === 'function'
      ? this as object : undefined;
    let method = receiver ? methods.get(receiver) : unboundMethod;

    if (!method) {
      method = firstMethod ?? create();
      firstMethod = undefined;

      if (receiver) {
        methods.set(receiver, method);
      } else {
        // Calls without an instance retain a separate shared wrapper.
        unboundMethod = method;
      }
    }

    return method.apply(this, args) as ReturnType<F>;
  } as F;
}
