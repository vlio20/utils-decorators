import { readonly } from './readonly';
import { describe, it } from 'node:test';
import assert from 'node:assert';

class T {
  @readonly() prop = 2;
}

describe('readonly', () => {
  it('should verify readonly throws exception when trying to write to it', () => {
    const t = new T();

    assert(t.prop === 2);
    assert.throws(() => {
      t.prop = 3;
    }, Error('Cannot assign to read only property \'prop\' of object \'#<T>\''));
  });
});