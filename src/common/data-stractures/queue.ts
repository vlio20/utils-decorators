export class Queue<T> {
  private firstItem: Node<T> | null = null;

  private lastItem: Node<T> | null = null;

  private size = 0;

  getSize(): number {
    return this.size;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  enqueue(item: T): void {
    const newItem = Queue.createItem(item);

    if (!this.lastItem) {
      this.firstItem = newItem;
      this.lastItem = newItem;
    } else {
      this.lastItem.next = newItem;
      this.lastItem = newItem;
    }

    this.size += 1;
  }

  dequeue(): T | null {
    const item = this.firstItem;
    if (!item) {
      return null;
    }

    this.firstItem = item.next;
    this.size -= 1;
    if (!this.firstItem) {
      this.lastItem = null;
    }

    return item.value;
  }

  private static createItem<T>(value: T): Node<T> {
    return {
      next: null,
      value,
    };
  }
}

interface Node<T> {
  next: Node<T> | null;
  value: T;
}
