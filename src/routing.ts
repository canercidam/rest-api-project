import { IRouterMatcher, IRouter } from 'express';
import { SwaggerObject } from 'swagger-express-middleware';
import asyncHandler from 'express-async-handler';
import { HandlerRegistry } from './handlers/HandlerRegistry';

export interface RouteDefinition {
  method: string;
  path: string;
}

export interface RouteDefinitions {
  [name: string]: RouteDefinition | undefined;
}

function fixPath(path: string, basePath?: string) {
  const fixedPath = path.replace(/\{/g, ':').replace(/\}/g, '');
  return (basePath ? basePath + fixedPath : fixedPath);
}

export function getRouteDefinitions(api: SwaggerObject): RouteDefinitions {
  const defs: RouteDefinitions = {};

  Object.keys(api.paths).forEach((swaggerPath) => {
    const methods = api.paths[swaggerPath];
    const path = fixPath(swaggerPath, api.basePath);

    Object.keys(methods).forEach((method) => {
      const name = methods[method].operationId;
      if (name === undefined) throw new Error(`operationId not defined for '${method}' ${swaggerPath}`);
      defs[name] = { path, method };
    });
  });

  return defs;
}

export interface Router {
  [method: string]: IRouterMatcher<IRouter>;
}

/**
 * Sets express handler routes using Swagger definitions.
 * @param app - express app asserted as Router
 * @param api - Swagger object that includes all definitions
 */
export function setRoutes(app: Router, api: SwaggerObject) {
  const defs = getRouteDefinitions(api);

  const { allHandlers } = HandlerRegistry;
  allHandlers.forEach((handler) => {
    const { name } = handler;
    const def = defs[name];
    if (def === undefined) {
      throw new Error(`no definition found for handler ${name}. Did you set the operationId correctly in Swagger definition?`);
    }

    // Express routing.
    app[def.method](def.path, asyncHandler(handler));
  });
}
