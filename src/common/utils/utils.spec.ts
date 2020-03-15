import {isPromise} from './utils';

describe('utils', () => {
  describe('isPromise', () => {
    it('should return true if a Promise or an object with then attribute', () => {
      expect(isPromise(Promise.resolve())).toBe(true);
      expect(isPromise({then: () => null})).toBe(true);
    });

    it('should return false if not a Promise and not an object with then', () => {
      expect(isPromise({})).toBe(false);
      expect(isPromise(2)).toBe(false);
      expect(isPromise(true)).toBe(false);
      expect(isPromise(null)).toBe(false);
      expect(isPromise(undefined)).toBe(false);
    });
  });
});
