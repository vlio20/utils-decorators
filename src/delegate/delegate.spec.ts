import {delegate} from './delegate';

describe('delegate', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidDelegate: any = delegate();

      class T {
        @nonValidDelegate
        boo: string;
      }
    } catch (e) {
      expect('@delegate is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });
});
