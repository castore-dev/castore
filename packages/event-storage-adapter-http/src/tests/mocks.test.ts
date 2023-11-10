export const swagger = {
  swagger: '3.0.0',
  openapi: '3.0',
  info: {
    title: 'Test Swagger',
    description: 'The Castore API',
    version: '1.0.0',
    license: {
      name: 'Castore',
    },
  },
  basePath: '/api/v2',
  tags: [
    {
      name: 'event',
    },
  ],
  schemes: ['https'],
  paths: {
    '/event': {
      get: {
        tags: ['event'],
        operationId: 'getEvents',
        produces: ['application/json'],
        responses: {
          '200': {
            description: 'successful operation',
            schema: {
              $ref: '#/definitions/Page',
            },
          },
          '400': {
            description: 'Invalid aggregate ID supplied',
          },
          '404': {
            description: 'Event not found',
          },
        },
      },
    },
  },
  definitions: {
    Page: {
      type: 'object',
      properties: {
        count: {
          type: 'integer',
          format: 'int64',
        },
        next: {
          type: 'string',
        },
        previous: {
          type: 'string',
        },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              url: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    Event: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          format: 'int64',
        },
        height: {
          type: 'integer',
          format: 'int64',
        },
        weight: {
          type: 'integer',
          format: 'int64',
        },
        name: {
          type: 'string',
          example: 'bulbasaur',
        },
        sprites: {
          $ref: '#/definitions/Sprite',
        },
      },
    },
  },
};
