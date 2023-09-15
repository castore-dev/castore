import { OpenAPI, OpenAPIV2, OpenAPIV3_1 } from 'openapi-types';

import {
  ApiMethod,
  CastoreOperationObject,
  Path,
  SwaggerClient,
} from './types';

const getSwaggerPaths = (paths: OpenAPI.Document['paths']) => {
  if (paths === undefined) {
    return undefined;
  }

  return Object.entries(paths).flatMap(([path, verbs]) => {
    if (verbs === undefined) {
      return [];
    }

    return Object.entries(verbs as OpenAPIV2.PathsObject).map(
      ([verb, route]) => ({
        path,
        verb,
        route: route as OpenAPIV3_1.OperationObject,
      }),
    );
  });
};

export const getApiMethod =
  (swagger: OpenAPI.Document) =>
  (methodName: string): Path | undefined => {
    const paths = getSwaggerPaths(swagger.paths);

    if (paths === undefined) {
      return undefined;
    }

    const methodPath = paths.find(
      ({ route }) =>
        // @ts-ignore x-castore-operationId is an extension of the openAPI spec
        route['x-castore-operationId'] === methodName ||
        route.operationId === methodName,
    );

    return methodPath;
  };

export const compileOperation = (
  client: SwaggerClient,
  path: Path,
): ApiMethod => {
  const route = path.route as CastoreOperationObject;
  const tag = route.tags?.[0] ?? 'default';
  const operationId = route.operationId as string;

  const method = client.apis[tag]?.[operationId] as ApiMethod;

  return method;
};
