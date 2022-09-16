/**
 * @name InvalidSnapshotIntervalError
 * @description Error thrown when the snapshot interval value is invalid
 */
export class InvalidSnapshotIntervalError extends Error {
  snapshotInterval: number;

  constructor({ snapshotInterval }: { snapshotInterval: number }) {
    super(
      `Invalid snapshot interval value ${snapshotInterval}. It should at least set to 2. `,
    );

    this.snapshotInterval = snapshotInterval;
  }
}
