import { Method } from '../common/model/common.model';

export function throttlify<M extends Method<any>>(originalMethod: M, delayMs: number): M {
  let throttling = false;
  return function (...args: any[]): any {
    if (!throttling) {
      throttling = true;
      originalMethod.apply(this, args);

      setTimeout(() => {
        throttling = false;
      }, delayMs);
    }
  } as M;
}
