declare module 'swagger-client' {
  import { OpenAPI } from 'openapi-types';
  import { Api } from './types';
  export default class SwaggerClient {
    [x: string]: unknown;
    http(request: unknown): unknown;
    client: {
      apis: {
        default: Api;
        event?: Api;
      };
    };
    apis: {
      default: Api;
      event?: Api;
    };
    tags: OpenAPIV3_1.TagObject[];

    constructor(
      url: string | { swagger: OpenAPI.Document } | OpenAPI.Document,
      options?: Record<string, unknown>,
    );
  }
}
