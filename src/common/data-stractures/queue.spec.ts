import { Queue } from './queue';

describe('Queue', () => {
  it('should initialize with size 0', () => {
    const queue = new Queue<number>();
    expect(queue.getSize()).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should enqueue items and update size', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    expect(queue.getSize()).toBe(1);
    expect(queue.isEmpty()).toBe(false);
    queue.enqueue(2);
    expect(queue.getSize()).toBe(2);
  });

  it('should dequeue items in the correct order', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.dequeue()).toBe(1);
    expect(queue.getSize()).toBe(1);
    expect(queue.dequeue()).toBe(2);
    expect(queue.getSize()).toBe(0);
    expect(queue.isEmpty()).toBe(true);
  });

  it('should return null when dequeue is called on an empty queue', () => {
    const queue = new Queue<number>();
    expect(queue.dequeue()).toBeNull();
  });

  it('should handle enqueue and dequeue operations correctly', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    expect(queue.dequeue()).toBe(1);
    queue.enqueue(4);
    expect(queue.dequeue()).toBe(2);
    expect(queue.dequeue()).toBe(3);
    expect(queue.dequeue()).toBe(4);
    expect(queue.isEmpty()).toBe(true);
  });
});