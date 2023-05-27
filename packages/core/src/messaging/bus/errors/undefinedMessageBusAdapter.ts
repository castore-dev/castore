export class UndefinedMessageBusAdapterError extends Error {
  constructor({ messageBusId }: { messageBusId: string }) {
    super(`Message Bus Adapter undefined for message bus ${messageBusId}`);
  }
}
