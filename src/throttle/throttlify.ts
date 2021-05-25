import { Method } from '../common/model/common.model';

export function throttlify(originalMethod: Method<any>, delayMs: number): Method<any> {
  let throttling = false;
  return function (...args: any[]): any {
    if (!throttling) {
      throttling = true;
      originalMethod.apply(this, args);

      setTimeout(() => {
        throttling = false;
      }, delayMs);
    }
  };
}
