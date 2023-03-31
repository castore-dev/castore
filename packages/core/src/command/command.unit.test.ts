import { randomUUID } from 'crypto';

import type { EventDetail } from '~/event/eventDetail';

import {
  counterEventsMocks,
  counterEventStore,
  getEventsMock,
  incrementCounter,
  MockedEventAlreadyExistsError,
  onEventAlreadyExistsMock,
  pushEventMock,
  requiredEventStores,
} from './command.fixtures.test';

getEventsMock.mockResolvedValue({ events: counterEventsMocks });

describe('command implementation', () => {
  const expectedProperties = new Set([
    'commandId',
    'requiredEventStores',
    'eventAlreadyExistsRetries',
    'onEventAlreadyExists',
    'handler',
  ]);

  it('has correct properties', () => {
    expect(new Set(Object.keys(incrementCounter))).toStrictEqual(
      expectedProperties,
    );

    expect(
      incrementCounter.requiredEventStores.map(
        ({ eventStoreId }) => eventStoreId,
      ),
    ).toStrictEqual(
      requiredEventStores.map(({ eventStoreId }) => eventStoreId),
    );
  });

  describe('onEventAlreadyExists retry behavior', () => {
    const throwEventAlreadyExistsError = (
      { aggregateId, version }: EventDetail,
      { eventStoreId }: { eventStoreId: string },
    ) => {
      throw new MockedEventAlreadyExistsError({
        eventStoreId,
        aggregateId,
        version,
      });
    };

    const counterId = '123';

    const expectedError = new MockedEventAlreadyExistsError({
      eventStoreId: counterEventStore.eventStoreId,
      aggregateId: counterId,
      version: counterEventsMocks.length + 1,
    });

    beforeEach(() => {
      pushEventMock.mockClear();
      onEventAlreadyExistsMock.mockClear();
    });

    it('retries 3 times on EventAlreadyExists error (success at 3rd attempt)', async () => {
      pushEventMock
        .mockImplementationOnce(throwEventAlreadyExistsError)
        .mockImplementationOnce(throwEventAlreadyExistsError)
        .mockResolvedValue({ event: { counterId: '123' } });

      await incrementCounter.handler(
        { counterId: '123' },
        [counterEventStore],
        { generateUuid: randomUUID },
      );

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
        incrementCounter.handler({ counterId: '123' }, [counterEventStore], {
          generateUuid: randomUUID,
        }),
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
