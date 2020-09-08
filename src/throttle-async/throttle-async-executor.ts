import {AsyncMethod} from '../common/model/common.model';

export class ThrottleAsyncExecutor<D> {
  private onGoingCallsCount = 0;

  private futureCallsArgs: any[][] = [];

  private lastProm: Promise<D> = Promise.resolve(null);

  constructor(
    private readonly fun: AsyncMethod<D>,
    private readonly parallelCalls,
  ) {
  }

  async exec(context: any, args: any[]): Promise<D> {
    if (this.onGoingCallsCount < this.parallelCalls) {
      this.onGoingCallsCount += 1;

      this.lastProm = this.fun.apply(context, args)
        .then((res) => res)
        .finally(() => {
          this.onGoingCallsCount -= 1;
        });

      return this.lastProm;
    }

    return this.invoke(context, args);
  }

  private async invoke(context: any, args: any[]): Promise<D> {
    this.futureCallsArgs.push(args);
    const res = await this.lastProm;

    this.onGoingCallsCount -= 1;
    this.lastProm = this.fun.apply(context, this.futureCallsArgs.pop());

    return this.lastProm;
  }
}
