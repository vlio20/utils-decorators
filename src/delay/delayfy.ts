import { Method } from '../common/model/common.model';

export function delayfy<D = any, A extends any[] = any[]>(originalMethod: Method<D, A>, delayMs: number): Method<void, A> {
  return function (...args: A): void {
    setTimeout(() => {
      originalMethod.apply(this, args);
    }, delayMs);
  };
}
