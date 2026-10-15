import { AsyncMethod } from '../common/model/common.model';
import { Queue } from '../common/data-stractures/queue';

export class ThrottleAsyncExecutor<D> {
  private onGoingCallsCount = 0;

  private callsToRun = new Queue<CallArgs<D>>();

  constructor(
    private readonly fun: AsyncMethod<D>,
    private readonly parallelCalls: number,
  ) {
  }

  exec(context: any, args: any[]): Promise<D> {
    const proms = new Promise<D>((resolve, reject) => {
      this.callsToRun.enqueue({ context, args, resolve, reject });
    });

    this.tryCall();

    (proms as any).hell = args[0];

    return proms;
  }

  private tryCall(): void {
    if (this.callsToRun.getSize() > 0 && this.onGoingCallsCount < this.parallelCalls) {
      const callArgs = this.callsToRun.dequeue();
      if (!callArgs) {
        return;
      }
      const { context, args, resolve, reject } = callArgs;
      this.onGoingCallsCount += 1;
      this.fun.apply(context, args)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.onGoingCallsCount -= 1;
          this.tryCall();
        });
    }
  }
}

interface CallArgs<T> {
  context: any;
  args: any[];
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}
