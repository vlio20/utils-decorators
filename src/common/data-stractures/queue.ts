export class Queue<T> {
  private firstItem: Node<T> = null;

  private lastItem: Node<T> = null;

  private size = 0;

  getSize(): number {
    return this.size;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  enqueue(item: T): void {
    const newItem = Queue.createItem(item);

    if (this.isEmpty()) {
      this.firstItem = newItem;
      this.lastItem = newItem;
    } else {
      this.lastItem.next = newItem;
      this.lastItem = newItem;
    }

    this.size += 1;
  }

  dequeue(): T {
    let removedItem = null;

    if (!this.isEmpty()) {
      removedItem = this.firstItem.value;
      this.firstItem = this.firstItem.next;
      this.size -= 1;
    }

    return removedItem;
  }

  private static createItem<T>(value: T): Node<T> {
    return {
      next: null,
      value,
    };
  }
}

interface Node<T> {
  next: Node<T>;
  value: T;
}
