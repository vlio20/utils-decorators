import {Decorator, Method} from '../common/model/common.model';

export function delayfy(originalMethod: Method<any>, delayMs: number): Method<void> {
  return function (...args: any[]): void {
    setTimeout(() => {
      originalMethod(args);
    }, delayMs);
  };
}
