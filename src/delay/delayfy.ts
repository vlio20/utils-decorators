import { Method } from '../common/model/common.model';

export function delayfy<M extends Method<any>>(originalMethod: M, delayMs: number): Method<void, Parameters<typeof originalMethod>> {
  return function (...args: any[]): void {
    setTimeout(() => {
      originalMethod.apply(this, args);
    }, delayMs);
  };
}
