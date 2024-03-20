# HTTP Event Storage Adapter

DRY Castore [`EventStorageAdapter`](https://castore-dev.github.io/castore/docs/event-sourcing/fetching-events/) implementation using a HTTP API.

This class is mainly useful when you already have the logic for events implemented and you want to expose your methods for a front-end to use them, eg.

## 📥 Installation

```bash
# npm
npm install @castore/event-storage-adapter-http

# yarn
yarn add @castore/event-storage-adapter-http
```

This package has `@castore/core` as peer dependency, so you will have to install it as well:

```bash
# npm
npm install @castore/core

# yarn
yarn add @castore/core
```

### 👩‍💻 Usage

```ts
import { HttpEventStorageAdapter } from '@castore/event-storage-adapter-http';
import { swagger } from './swagger.json'; // your swagger file


const pokemonHttpEventStorageAdapter = new HttpEventStorageAdapter({ swagger });

const pokemonEventStore = new EventStore({
  ...
  eventStorageAdapter: pokemonHttpEventStorageAdapter,
});
```

### 🤔 How it works

You need to expose 2 API endpoints that will be used by the adapter. They need to return the data correctly formatted:

- getEvents: `(aggregateId: string) => { events: EventDetail[] }`
- listAggregateIds: `() => ListAggregateIdsOutput`

See [here](https://castore-dev.github.io/castore/docs/event-sourcing/events/) for more details about the EventDetails type.
For the `ListAggregateIdsOutput` type:

```typescript
type ListAggregateIdsOutput = {
  aggregateIds: {
    aggregateId: string;
    initialEventTimestamp: string;
  }[];
  nextPageToken?: string;
};
```

Once your API is deployed, you can export is as an OpenAPI specification (swagger) and pass it to the adapter.
[Here](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-export.html) is how export an API gateway as a swagger.

This adapter uses the swagger passed in input to generate requests to you API endpoints.
For each method, it looks for the tags `operationId` in the swagger to generate the request.

The swagger should be typed like this, with at least the paths for the `getEvents` and `listAggregateIds` methods:

```typescript
type Swagger = {
  openapi: string; // the OpenAPI version you are using. Ex: 3.0.1
  info: {
    title: string; // the title of your API
    version: string; // timestamps
  };
  servers: {
    url: string; // the base url of your API
    variables: {
      basePath: {
        default: string; // the default value can be ''
      };
    };
  }[];
  paths: {
    [path: string]: {
      [verb: string]: {
        operationId: string; // the operation id for the castore method (getEvents | listAggregateIds)
        responses: {
          [statusCode: string]: {
            description: string;
            content?: {
              [type: string]: {
                schema: {
                  $ref: string;
                };
              };
            };
          };
          default: {
            description: string;
          };
        };
        parameters?: {
          name: string;
          in: string; // 'path' | 'query' | 'header' | 'cookie'
          description: string;
          required: boolean;
          format: string;
        }[];
      };
    };
  };
};
```

### 📝 Examples

Example of swagger:

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "event-store-api",
    "version": "2023-10-27 14:58:17UTC"
  },
  "servers": [
    {
      "url": "https://yourApiGatewayId.execute-api.eu-west-1.amazonaws.com/{basePath}",
      "variables": {
        "basePath": {
          "default": ""
        }
      }
    }
  ],
  "paths": {
    "/aggregateIds": {
      "get": {
        "responses": {
          "default": {
            "description": "Default response for GET /aggregateIds"
          }
        },
        "operationId": "listAggregateIds"
      }
    },
    "/events?aggregateId={aggregateId}": {
      "get": {
        "responses": {
          "default": {
            "description": "Default response for GET /events"
          }
        },
        "x-castore-operationId": "getEvents",
        // you can alternatively use the operationId field
        // "operationId": "getEvents",
        "parameters": [
          {
            "name": "aggregateId",
            "in": "path",
            "description": "aggregateId of the event-trace we want to retrieve",
            "required": true,
            "format": "int64"
          }
        ]
      }
    }
  }
}
```

Note that if you don't specify the `x-castore-operationId` or the `operationId` field, then the adapter will not be able to find the method to call.
