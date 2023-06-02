export class UndefinedMessageChannelAdapterError extends Error {
  constructor({
    messageChannelType,
    messageChannelId,
  }: {
    messageChannelType: string;
    messageChannelId: string;
  }) {
    super(
      `Adapter undefined for message ${messageChannelType} ${messageChannelId}`,
    );
  }
}
