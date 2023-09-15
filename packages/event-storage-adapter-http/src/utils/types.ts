import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';

export interface SwaggerClient {
  http(request: unknown): unknown;
  apis: Apis;
  tags: OpenAPIV3_1.TagObject[];
}

export type ApiResponse = {
  body: Record<string, unknown>;
};

export type ApiMethod = (
  arg: Record<string | number | symbol, unknown>,
) => Promise<ApiResponse>;

export type Api = Record<string, ApiMethod>;

export type Apis = Record<string, Api>;

export type Path = {
  path: string;
  verb: string;
  route: {
    tags?: string[] | undefined;
    summary?: string | undefined;
    description?: string | undefined;
    externalDocs?: OpenAPIV3.ExternalDocumentationObject | undefined;
    servers?: OpenAPIV3.ServerObject[] | undefined;
  };
};

export type CastoreOperationObject = OpenAPIV3.OperationObject & {
  'x-castore-operationId'?: string;
};
