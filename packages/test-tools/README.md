# 🦫 Castore/Test Tools - Tooling to test your EventStore 🔧

You already defined your EventStore? Now you probably want to test it! 🧪

## MockEventStore

You can test your EventStore by using the mockEventStore function. It only needs your EventStore and the events you want to initialize your MockedEventStore with (optional).

```ts
export const counterEventStore = new EventStore({
  eventStoreId: 'COUNTER',
  eventStoreEvents: [
    counterCreatedEvent,
    ...
  ],
  reducer,
  storageAdapter,
});

export const counterCreatedEventMock: EventStoreEventsDetails<
  typeof counterEventStore
> = {
  aggregateId: counterIdMock,
  version: 1,
  type: 'COUNTER_CREATED',
  timestamp: '2022',
  payload: {
    userId: 'c358dbfb-8a5e-47ca-82f4-ece787ffe224',
  },
};

const mockedCounterEventStore = mockEventStore(counterEventStore, [
  counterCreatedEventMock,
]);
```

## MockedEventStore

The MockEventStore function creates and returns a MockedEventStore.🤡  
It can be used exactly the same way as your EventStore, without impacting it.
The MockedEventStore has an InMemoryStorageAdapter. It means that the events you add to your mocked store in your tests will be stored in-memory, whatever is the storage adapter of your EventStore.

```ts
await mockedCounterEventStore.pushEvent(counterIncrementedEventMock);

await mockedCounterEventStore.getEvents(counterIdMock);
```

The only additional method of MockedEventStore is the reset. By calling it, you can go back to the initial state, ie your store with the initial events you gave at the creation of the MockedEventStore.

```ts
mockedCounterEventStore.reset();
```
