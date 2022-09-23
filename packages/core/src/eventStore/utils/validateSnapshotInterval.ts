export class InvalidSnapshotIntervalError extends Error {
  snapshotInterval: number;

  constructor({ snapshotInterval }: { snapshotInterval: number }) {
    super(
      `Invalid snapshot interval value ${snapshotInterval}. It should at least set to 2. `,
    );

    this.snapshotInterval = snapshotInterval;
  }
}

export const validateSnapshotInterval = (snapshotInterval: number): number => {
  if (
    snapshotInterval !== Infinity &&
    (!Number.isInteger(snapshotInterval) || snapshotInterval <= 1)
  ) {
    throw new InvalidSnapshotIntervalError({ snapshotInterval });
  }

  return snapshotInterval;
};
