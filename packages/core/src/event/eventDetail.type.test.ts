import type { A } from 'ts-toolbelt';

import type { EventDetail } from './eventDetail';

const assertAnyEventDetail: A.Equals<
  EventDetail,
  {
    aggregateId: string;
    version: number;
    timestamp: string;
    type: string;
    payload?: unknown;
    metadata?: unknown;
  }
> = 1;
assertAnyEventDetail;

const assertNoPayload: A.Equals<
  EventDetail<string, never>,
  {
    aggregateId: string;
    version: number;
    timestamp: string;
    type: string;
    metadata?: unknown;
  }
> = 1;
assertNoPayload;

const assertNoMetadata: A.Equals<
  EventDetail<string, unknown, never>,
  {
    aggregateId: string;
    version: number;
    timestamp: string;
    type: string;
    payload?: unknown;
  }
> = 1;
assertNoMetadata;

const assertNoMetadataNoPayload: A.Equals<
  EventDetail<string, never, never>,
  {
    aggregateId: string;
    version: number;
    timestamp: string;
    type: string;
  }
> = 1;
assertNoMetadataNoPayload;

const assertProvided: A.Equals<
  EventDetail<'test', 'payload', 'metadata'>,
  {
    aggregateId: string;
    version: number;
    timestamp: string;
    type: 'test';
    payload: 'payload';
    metadata: 'metadata';
  }
> = 1;
assertProvided;
