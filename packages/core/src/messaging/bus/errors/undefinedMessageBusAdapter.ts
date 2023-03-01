export class UndefinedMessageBusAdapterError extends Error {
  constructor({ messageBusId }: { messageBusId: string }) {
    super(`Storage Adapter undefined for event store ${messageBusId}`);
  }
}
