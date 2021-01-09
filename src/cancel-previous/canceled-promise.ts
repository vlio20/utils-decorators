export class CanceledPromise extends Error {
  constructor() {
    super('canceled');

    Object.setPrototypeOf(this, CanceledPromise.prototype);
  }
}
