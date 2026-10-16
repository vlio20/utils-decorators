import { Queue } from '../common/data-stractures/queue';

export class ThrottleAsyncExecutor<D, A extends unknown[], This = unknown> {
  private onGoingCallsCount = 0;

  private callsToRun = new Queue<CallArgs<D, A, This>>();

  constructor(
    private readonly fun: (this: This, ...args: A) => Promise<D>,
    private readonly parallelCalls: number,
  ) {
  }

  exec(context: This, args: A): Promise<D> {
    const proms = new Promise<D>((resolve, reject) => {
      this.callsToRun.enqueue({ context, args, resolve, reject });
    });

    this.tryCall();

    Object.assign(proms, { hell: args[0] });

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

interface CallArgs<T, A extends unknown[], This> {
  context: This;
  args: A;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}
