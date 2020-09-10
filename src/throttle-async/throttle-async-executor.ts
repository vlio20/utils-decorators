import {AsyncMethod} from '../common/model/common.model';

export class ThrottleAsyncExecutor<D> {
  private onGoingCallsCount = 0;

  private lastProm: Promise<D> = Promise.resolve(null);

  constructor(
    private readonly fun: AsyncMethod<D>,
    private readonly parallelCalls,
  ) {
  }

  async exec(context: any, args: any[]): Promise<D> {
    if (this.onGoingCallsCount < this.parallelCalls) {
      this.lastProm = this.handlePromise(this.fun.apply(context, args));
    } else {
      this.lastProm = this.lastProm
        .then(() => this.handlePromise(this.fun.apply(context, args)))
        .catch(() => this.handlePromise(this.fun.apply(context, args)));
    }

    return this.lastProm;
  }

  private async handlePromise(promise: Promise<D>): Promise<D> {
    this.onGoingCallsCount += 1;

    return promise
      .finally(() => {
        this.onGoingCallsCount -= 1;
      });
  }
}
