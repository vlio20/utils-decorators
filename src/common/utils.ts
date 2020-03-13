export class TaskExec {
  private tasks: TimedTask[] = [];
  private handler;

  exec(func: (...args: any) => any, ttl: number): void {
    this.tasks.push({func, execTime: Date.now() + ttl});
    this.tasks.sort((a, b) => {
      return a.execTime - b.execTime;
    });

    this.handleNext();
  }

  private handleNext(): void {
    if (!this.tasks.length) {
      return;
    }

    const {execTime} = this.tasks[0];
    this.execNext(Math.max(execTime - Date.now(), 0));
  }

  private execNext(ttl: number): void {
    clearTimeout(this.handler);
    this.handler = setTimeout(() => {
      const {func} = this.tasks.shift();
      func();
      this.handleNext();
    }, ttl);
  }
}

type TimedTask = {
  func: (...args: any) => any,
  execTime: number
};
