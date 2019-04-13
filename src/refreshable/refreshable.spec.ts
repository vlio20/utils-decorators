import {refreshable} from './refreshable';

describe('refreshable', () => {
  it('should populate refreshable property', (done) => {
    let counter = 0;
    const foo = () => {
      return counter++ % 2;
    };

    const dec = refreshable<any, number>(foo, 10);
    const t = <{prop: number}>{prop: 9};
    dec(t, 'prop');

    setTimeout(() => {
      expect(t.prop).toBe(0);
    }, 5);

    setTimeout(() => {
      expect(t.prop).toBe(1);
      done();
    }, 15);
  });
});
