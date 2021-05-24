import { Method } from '../common/model/common.model';

export function debouncify(originalMethod: Method<any>, delayMs: number): Method<any> {
  let handler: any;

  return function (...args: any[]): any {
    clearTimeout(handler);

    handler = setTimeout(() => {
      originalMethod.apply(this, args);
    }, delayMs);
  };
}
