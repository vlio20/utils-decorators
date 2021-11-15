import { Method } from '../common/model/common.model';

export function throttlify<D = any, A extends any[] = any[]>(originalMethod: Method<D, A>, delayMs: number): Method<void, A> {
  let throttling = false;
  return function (...args: A): void {
    if (!throttling) {
      throttling = true;
      originalMethod.apply(this, args);

      setTimeout(() => {
        throttling = false;
      }, delayMs);
    }
  };
}
