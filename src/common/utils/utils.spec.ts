import { isPromise } from './utils';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('utils', () => {
  describe('isPromise', () => {
    it('should return true if a Promise or an object with then attribute', () => {
      assert.equal(isPromise(Promise.resolve()), true);
      assert.equal(isPromise({ then: () => null }), true);
    });

    it('should return false if not a Promise and not an object with then', () => {
      assert.equal(isPromise({}), false);
      assert.equal(isPromise(2), false);
      assert.equal(isPromise(true), false);
      assert.equal(isPromise(null), false);
      assert.equal(isPromise(undefined), false);
    });
  });
});