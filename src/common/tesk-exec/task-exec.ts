import TinyQueue from 'tinyqueue';

export class TaskExec {
  private tasks = new TinyQueue<TimedTask>([], (a, b) => a.execTime - b.execTime);

  private handler: ReturnType<typeof setTimeout> | undefined;

  exec(func: (...args: any) => any, ttl: number): void {
    this.tasks.push({ func, execTime: Date.now() + ttl });
    this.handleNext();
  }

  private handleNext(): void {
    const task = this.tasks.peek();
    if (!task) {
      return;
    }

    const { execTime } = task;
    this.execNext(Math.max(execTime - Date.now(), 0));
  }

  private execNext(ttl: number): void {
    clearTimeout(this.handler);
    this.handler = setTimeout(() => {
      const task = this.tasks.pop();
      if (task) {
        task.func();
      }
      this.handleNext();
    }, ttl);
  }
}

type TimedTask = {
  func: (...args: any) => any;
  execTime: number;
};
