export class EventDetailTypeDoesNotExistError extends Error {
  constructor({
    type,
    allowedTypes,
  }: {
    type: string;
    allowedTypes: string[];
  }) {
    super(
      `${type} is not a valid event detail type. Allowed types are ${allowedTypes.join(
        ', ',
      )}.`,
    );
  }
}
