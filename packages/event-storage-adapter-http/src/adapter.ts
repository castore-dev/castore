import { OpenAPI } from 'openapi-types';

import {
  EventDetail,
  EventStorageAdapter,
  EventsQueryOptions,
  GroupedEvent,
  ListAggregateIdsOutput,
} from '@castore/core';

import { getApiMethod, compileOperation } from './utils/getApiMethod';
import { getSwaggerClient } from './utils/getSwaggerClient';
import { SwaggerClient, Path } from './utils/types';

export class HttpEventStorageAdapter implements EventStorageAdapter {
  getEvents: EventStorageAdapter['getEvents'];
  listAggregateIds: EventStorageAdapter['listAggregateIds'];
  pushEvent: EventStorageAdapter['pushEvent'];
  pushEventGroup: EventStorageAdapter['pushEventGroup'];
  groupEvent: EventStorageAdapter['groupEvent'];
  swagger: OpenAPI.Document;
  client: Promise<SwaggerClient>;
  getApiMethod: (method: string) => Path | undefined;
  getEventsMethod: ({
    aggregateId,
    options,
  }: {
    aggregateId: string;
    options?: EventsQueryOptions;
  }) => Promise<unknown>;
  listAggregateIdsMethod: () => Promise<unknown>;

  constructor({ swagger }: { swagger: OpenAPI.Document }) {
    this.swagger = swagger;
    this.client = getSwaggerClient({ swagger: this.swagger });
    this.getApiMethod = getApiMethod(this.swagger);

    this.getEventsMethod = async () => {
      const client = await this.client;
      const getEventsPath = this.getApiMethod('getEvents');

      if (getEventsPath === undefined) {
        throw new Error('getEvents operation not found');
      }

      const getEvents = compileOperation(client, getEventsPath);

      return getEvents;
    };

    this.listAggregateIdsMethod = async () => {
      const client = await this.client;
      const listAggregateIdsPath = this.getApiMethod('listAggregateIds');

      if (listAggregateIdsPath === undefined) {
        throw new Error('listAggregateIds operation not found');
      }
      const listAggregateIds = compileOperation(client, listAggregateIdsPath);

      return listAggregateIds;
    };

    this.getEvents = async (aggregateId: string, _, options) => {
      const { body } = (await this.getEventsMethod({
        aggregateId,
        ...options,
      })) as { body: { events: EventDetail[] } };

      return body;
    };

    this.listAggregateIds = async (): Promise<ListAggregateIdsOutput> => {
      const { body } = (await this.listAggregateIdsMethod()) as {
        body: ListAggregateIdsOutput;
      };

      return body;
    };

    // We do not implement event groups in this adapter
    this.groupEvent = event =>
      new GroupedEvent({ event, eventStorageAdapter: this });
    this.pushEvent = () =>
      new Promise((_, reject) => reject('Not implemented yet'));
    this.pushEventGroup = () =>
      new Promise((_, reject) => reject('Not implemented yet'));
  }
}
