import { isInteger } from '~/utils/isInteger';

import type { Reducer, SnapshotMode } from './types';

// eslint-disable-next-line complexity
export const validateSnapshotMode = ({
  snapshotMode,
  autoSnapshotPeriodVersions,
  reducers,
  currentReducerVersion,
  reducer,
}: {
  snapshotMode: SnapshotMode;
  autoSnapshotPeriodVersions?: number;
  reducers?: Record<string, Reducer>;
  currentReducerVersion?: string;
  reducer?: Reducer;
}): void => {
  switch (snapshotMode) {
    case 'custom': {
      if (
        reducers === undefined ||
        currentReducerVersion === undefined ||
        reducer !== undefined ||
        reducers[currentReducerVersion] === undefined
      ) {
        throw new Error(
          "Invalid constructor args when using custom snapshots. Please provide matching 'reducers' and 'currentReducerVersion' options (not 'reducer').",
        );
      }

      break;
    }

    case 'auto': {
      if (
        reducers !== undefined ||
        currentReducerVersion === undefined ||
        reducer === undefined
      ) {
        throw new Error(
          "Invalid constructor args when using auto snapshots. Please provide 'reducer' and 'currentReducerVersion' options (not 'reducers').",
        );
      }

      if (
        !isInteger(autoSnapshotPeriodVersions) ||
        autoSnapshotPeriodVersions <= 1
      ) {
        throw new Error(
          "Invalid 'autoSnapshotPeriodVersions' args when using auto snapshots. Please provide an integer > 1.",
        );
      }

      break;
    }

    case 'none': {
      if (
        reducers !== undefined ||
        currentReducerVersion !== undefined ||
        reducer === undefined
      ) {
        throw new Error(
          "Invalid constructor args when not using snapshots. Please provide 'reducer' option only (not 'reducers' or 'currentReducerVersion').",
        );
      }

      break;
    }
  }
};
