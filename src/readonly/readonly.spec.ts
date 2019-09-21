import {readonly} from './readonly';

describe('readonly', () => {
  xit('should verify readonly throws exception when trying to write to it', () => {
    class T {

      @readonly()
      prop: number = 2;
    }

    const t = new T();

    expect(t.prop).toBe(2);

    try {
      t.prop = 4;
    } catch (e) {
      expect(e.message).toBe(`Cannot assign to read only property 'prop' of object '#<T>'`);

      return;
    }

    throw new Error(`shouldn't reach this line`);
  });
});
