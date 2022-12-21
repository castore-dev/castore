import {
  counterEventsMocks,
  getEventsMock,
  incrementCounter,
  incrementCounterA,
  incrementCounterANoOutput,
  incrementCounterNoOutput,
  inputSchema,
  outputSchema,
  requiredEventStores,
} from './jsonSchema.util.test';

getEventsMock.mockResolvedValue({ events: counterEventsMocks });

describe('jsonSchemaCommand implementation', () => {
  const expectedProperties = new Set([
    // applying super(...) apparently adds { _types: undefined } to the class
    '_types',
    'commandId',
    'requiredEventStores',
    'inputSchema',
    'outputSchema',
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

    expect(incrementCounter.inputSchema).toStrictEqual(inputSchema);
    expect(incrementCounter.outputSchema).toStrictEqual(outputSchema);
  });

  it('has correct properties (no output)', () => {
    expect(Object.keys(incrementCounterNoOutput)).toHaveLength(
      expectedProperties.size - 1,
    );
    expect(incrementCounterNoOutput.inputSchema).toStrictEqual(inputSchema);
  });

  it('has correct properties (no input)', () => {
    expect(Object.keys(incrementCounterA)).toHaveLength(
      expectedProperties.size - 1,
    );
    expect(incrementCounterA.outputSchema).toStrictEqual(outputSchema);
  });

  it('has correct properties (no input, no output)', () => {
    expect(Object.keys(incrementCounterANoOutput)).toHaveLength(
      expectedProperties.size - 2,
    );
  });
});
