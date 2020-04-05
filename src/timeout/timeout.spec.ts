import {timeout} from './timeout';

describe('timeout', () => {
  it('should make sure error thrown when decorator not set on method', () => {
    try {
      const nonValidTimeout: any = timeout(50);

      class T {
        @nonValidTimeout
        boo: string;
      }
    } catch (e) {
      expect('@timeout is applicable only on a methods.').toBe(e.message);

      return;
    }

    throw new Error('should not reach this line');
  });
});
