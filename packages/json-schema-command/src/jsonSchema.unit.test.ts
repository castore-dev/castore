import { EventDetail, EventAlreadyExistsError } from '@castore/core';

import {
  counterEventsMocks,
  counterEventStore,
  getEventsMock,
  getLastSnapshotMock,
  incrementCounter,
  incrementCounterA,
  incrementCounterANoOutput,
  incrementCounterNoOutput,
  inputSchema,
  onEventAlreadyExistsMock,
  outputSchema,
  pushEventMock,
  requiredEventStores,
  userEventStore,
} from './jsonSchema.util.test';

getEventsMock.mockResolvedValue({ events: counterEventsMocks });
getLastSnapshotMock.mockResolvedValue({ snapshot: undefined });

describe('jsonSchemaCommand implementation', () => {
  it('has correct properties', () => {
    expect(new Set(Object.keys(incrementCounter))).toStrictEqual(
      new Set([
        'commandId',
        'requiredEventStores',
        'inputSchema',
        'outputSchema',
        'eventAlreadyExistsRetries',
        'onEventAlreadyExists',
        'handler',
      ]),
    );

    expect(
      incrementCounter.requiredEventStores.map(
        ({ eventStoreId }) => eventStoreId,
      ),
    ).toStrictEqual(
      requiredEventStores.map(({ eventStoreId }) => eventStoreId),
    );

    expect(incrementCounter.inputSchema).toStrictEqual(inputSchema);
    expect(incrementCounter.outputSchema).toStrictEqual(outputSchema);
  });

  it('has correct properties (no output)', () => {
    expect(Object.keys(incrementCounterNoOutput)).toHaveLength(6);
    expect(incrementCounterNoOutput.inputSchema).toStrictEqual(inputSchema);
  });

  it('has correct properties (no input)', () => {
    expect(Object.keys(incrementCounterA)).toHaveLength(6);
    expect(incrementCounterA.outputSchema).toStrictEqual(outputSchema);
  });

  it('has correct properties (no input, no output)', () => {
    expect(Object.keys(incrementCounterANoOutput)).toHaveLength(5);
  });

  describe('onEventAlreadyExists retry behavior', () => {
    const throwEventAlreadyExistsError = (
      { aggregateId, version }: EventDetail,
      { eventStoreId }: { eventStoreId: string },
    ) => {
      throw new EventAlreadyExistsError({
        eventStoreId,
        aggregateId,
        version,
      });
    };

    const counterId = '123';

    const expectedError = new EventAlreadyExistsError({
      eventStoreId: counterEventStore.eventStoreId,
      aggregateId: counterId,
      version: counterEventsMocks.length + 1,
    });

    it('retries 3 times on EventAlreadyExists error (success at 3rd attempt)', async () => {
      pushEventMock
        .mockImplementationOnce(throwEventAlreadyExistsError)
        .mockImplementationOnce(throwEventAlreadyExistsError)
        .mockResolvedValue(undefined);

      await incrementCounter.handler({ counterId: '123' }, [
        counterEventStore,
        userEventStore,
      ]);

      expect(pushEventMock).toHaveBeenCalledTimes(3);

      expect(onEventAlreadyExistsMock).toHaveBeenCalledTimes(2);
      expect(onEventAlreadyExistsMock).toHaveBeenCalledWith(expectedError, {
        attemptNumber: 1,
        retriesLeft: 2,
      });
      expect(onEventAlreadyExistsMock).toHaveBeenCalledWith(expectedError, {
        attemptNumber: 2,
        retriesLeft: 1,
      });
    });

    it('retries 3 times on EventAlreadyExists error (all attempts fail)', async () => {
      pushEventMock.mockImplementation(throwEventAlreadyExistsError);

      await expect(() =>
        incrementCounter.handler({ counterId: '123' }, [
          counterEventStore,
          userEventStore,
        ]),
      ).rejects.toThrow(expectedError);

      expect(pushEventMock).toHaveBeenCalledTimes(3);

      expect(onEventAlreadyExistsMock).toHaveBeenCalledTimes(3);
      expect(onEventAlreadyExistsMock).toHaveBeenCalledWith(expectedError, {
        attemptNumber: 1,
        retriesLeft: 2,
      });
      expect(onEventAlreadyExistsMock).toHaveBeenCalledWith(expectedError, {
        attemptNumber: 2,
        retriesLeft: 1,
      });
      expect(onEventAlreadyExistsMock).toHaveBeenCalledWith(expectedError, {
        attemptNumber: 3,
        retriesLeft: 0,
      });
    });
  });
});
