import {
  incrementCounter,
  incrementCounterA,
  incrementCounterANoOutput,
  incrementCounterNoOutput,
  inputSchema,
  outputSchema,
  requiredEventStores,
} from './jsonSchema.util.test';

describe('jsonSchemaCommand implementation', () => {
  it('has correct properties', () => {
    expect(new Set(Object.keys(incrementCounter))).toStrictEqual(
      new Set([
        'requiredEventStores',
        'inputSchema',
        'outputSchema',
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
    expect(Object.keys(incrementCounterNoOutput)).toHaveLength(3);
    expect(incrementCounterNoOutput.inputSchema).toStrictEqual(inputSchema);
  });

  it('has correct properties (no input)', () => {
    expect(Object.keys(incrementCounterA)).toHaveLength(3);
    expect(incrementCounterA.outputSchema).toStrictEqual(outputSchema);
  });

  it('has correct properties (no input, no output)', () => {
    expect(Object.keys(incrementCounterANoOutput)).toHaveLength(2);
  });
});
