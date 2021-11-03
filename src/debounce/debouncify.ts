import { Method } from '../common/model/common.model';

export function debouncify<M extends Method<any>>(originalMethod: M, delayMs: number): M {
  let handler: any;

  return function (...args: any[]): any {
    clearTimeout(handler);

    handler = setTimeout(() => {
      originalMethod.apply(this, args);
    }, delayMs);
  } as M;
}
