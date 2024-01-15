import { EventType } from './eventType';
import { __AGGREGATE_EXISTS__, __REPLAYED__ } from './reservedEventTypes';

const eventType = new EventType({ type: 'some type' });

describe('event store', () => {
  it('has correct properties', () => {
    expect(new Set(Object.keys(eventType))).toStrictEqual(
      new Set(['type', 'parseEventDetail']),
    );
  });

  it('raises an error if type is reserved', () => {
    expect(() => new EventType({ type: __REPLAYED__ })).toThrow();
    expect(() => new EventType({ type: __AGGREGATE_EXISTS__ })).toThrow();
  });
});
