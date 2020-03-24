import TinyQueue from 'tinyqueue';

export class TaskExec {
  private tasks = new TinyQueue<TimedTask>([], (a, b) => a.execTime - b.execTime);

  private handler;

  exec(func: (...args: any) => any, ttl: number): void {
    this.tasks.push({func, execTime: Date.now() + ttl});
    this.handleNext();
  }

  private handleNext(): void {
    if (!this.tasks.length) {
      return;
    }

    const {execTime} = this.tasks.peek();
    this.execNext(Math.max(execTime - Date.now(), 0));
  }

  private execNext(ttl: number): void {
    clearTimeout(this.handler);
    this.handler = setTimeout(() => {
      const {func} = this.tasks.pop();
      func();
      this.handleNext();
    }, ttl);
  }
}

type TimedTask = {
  func: (...args: any) => any;
  execTime: number;
};
