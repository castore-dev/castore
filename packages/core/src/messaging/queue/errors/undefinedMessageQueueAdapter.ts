export class UndefinedMessageQueueAdapterError extends Error {
  constructor({ messageQueueId }: { messageQueueId: string }) {
    super(
      `Message Queue Adapter undefined for message queue ${messageQueueId}`,
    );
  }
}
