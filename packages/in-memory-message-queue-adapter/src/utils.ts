export const parseRetryDelayInMs = (retryDelayInMs: number): number => {
  if (typeof retryDelayInMs !== 'number' || retryDelayInMs < 0) {
    throw new Error('Invalid retryDelayInMs, please select a positive number.');
  }

  return Math.round(retryDelayInMs);
};

export const parseRetryAttempts = (retryAttempts: number): number => {
  if (typeof retryAttempts !== 'number' || retryAttempts < 0) {
    throw new Error('Invalid retryAttempts, please select a positive integer.');
  }

  return Math.round(retryAttempts);
};

export const parseBackoffRate = (backoffRate: number): number => {
  if (typeof backoffRate !== 'number' || backoffRate < 0) {
    throw new Error('Invalid backoffRate, please select a positive number.');
  }

  return backoffRate;
};
