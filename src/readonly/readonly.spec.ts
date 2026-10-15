import { readonly } from './readonly';

describe('readonly', () => {
  it('should initialize readonly properties independently for each instance', () => {
    class T {
      @readonly()
        prop: number;

      constructor(value: number) {
        this.prop = value;
      }
    }

    const first = new T(2);
    const second = new T(3);

    expect(first.prop).toBe(2);
    expect(second.prop).toBe(3);
    expect(Object.keys(first)).toEqual(['prop']);
    expect(() => { first.prop = 4; }).toThrow(TypeError);
    expect(() => { second.prop = 5; }).toThrow(TypeError);
  });

  it('should mark an existing descriptor as readonly', () => {
    const descriptor = { value: 2, writable: true };
    const result = readonly()({}, 'prop', descriptor);

    expect(result).toBe(descriptor);
    expect(descriptor.writable).toBe(false);
  });

  it('should verify readonly throws exception when trying to write to it', () => {
    class T {
      @readonly()
        prop = 2;
    }

    const t = new T();

    expect(t.prop).toBe(2);

    try {
      t.prop = 4;
    } catch (e) {
      if (!(e instanceof Error)) {
        throw e;
      }

      expect(e.message).toBe('Cannot assign to read only property \'prop\' of object \'#<T>\'');

      return;
    }

    throw new Error('shouldn\'t reach this line');
  });
});
