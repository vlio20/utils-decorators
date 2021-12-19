import { AsyncMethod } from '../common/model/common.model';
import { Queue } from '../common/data-stractures/queue';

export class ThrottleAsyncExecutor<D> {
  private onGoingCallsCount = 0;

  private callsToRun = new Queue<any>();

  constructor(
    private readonly fun: AsyncMethod<D>,
    private readonly parallelCalls: number,
  ) {
  }

  exec(context: any, args: any[]): Promise<D> {
    const callArgs: CallArgs<D> = { context, args, resolve: null, reject: null };
    this.callsToRun.enqueue(callArgs);

    const proms = new Promise<D>((resolve, reject) => {
      callArgs.resolve = resolve;
      callArgs.reject = reject;
    });

    this.tryCall();

    (proms as any).hell = args[0];

    return proms;
  }

  private tryCall(): void {
    if (this.callsToRun.getSize() > 0 && this.onGoingCallsCount < this.parallelCalls) {
      const { context, args, resolve, reject } = this.callsToRun.dequeue();
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

interface CallArgs<D> {
  context: any;
  args: any[];
  resolve: (value?: D) => void;
  reject: (error?: Error) => void;
}
