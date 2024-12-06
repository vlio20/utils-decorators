import { Queue } from './queue';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Queue', () => {
  it('should initialize with size 0', () => {
    const queue = new Queue<number>();
    assert.strictEqual(queue.getSize(), 0);
    assert.strictEqual(queue.isEmpty(), true);
  });

  it('should enqueue items and update size', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    assert.strictEqual(queue.getSize(), 1);
    assert.strictEqual(queue.isEmpty(), false);
    queue.enqueue(2);
    assert.strictEqual(queue.getSize(), 2);
  });

  it('should dequeue items in the correct order', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    assert.strictEqual(queue.dequeue(), 1);
    assert.strictEqual(queue.getSize(), 1);
    assert.strictEqual(queue.dequeue(), 2);
    assert.strictEqual(queue.getSize(), 0);
    assert.strictEqual(queue.isEmpty(), true);
  });

  it('should return null when dequeue is called on an empty queue', () => {
    const queue = new Queue<number>();
    assert.strictEqual(queue.dequeue(), null);
  });

  it('should handle enqueue and dequeue operations correctly', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    queue.enqueue(3);
    assert.strictEqual(queue.dequeue(), 1);
    queue.enqueue(4);
    assert.strictEqual(queue.dequeue(), 2);
    assert.strictEqual(queue.dequeue(), 3);
    assert.strictEqual(queue.dequeue(), 4);
    assert.strictEqual(queue.isEmpty(), true);
  });
});