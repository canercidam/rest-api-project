import * as dotenv from 'dotenv';
import { createPool, PoolConfig } from 'mysql';
import * as express from 'express';
import SwaggerExpressMiddleware, { SwaggerObject } from 'swagger-express-middleware';
import swaggerUI from 'swagger-ui-express';
import morgan from 'morgan';
import { Repository } from './repository/Repository';
import { setRepository } from './handlers/Repository';
import { setRoutes, Router } from './routing';
import { queryFormat } from './repository/helpers';
import { errorHandler } from './handlers/status';

// Get vars from .env file if present.
dotenv.config();
const { env } = process;

const pool = createPool(<PoolConfig>{
  connectionLimit: env.DB_CONNECTION_LIMIT || 4,
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  timezone: 'utc',
  queryFormat,
});

const repository = new Repository(pool);
setRepository(repository);

env.SERVER_PORT = env.SERVER_PORT || '8080';
const app = express.default();

export interface Service {
  close: () => void;
  api: SwaggerObject;
}

let serviceCreated: (value: Service) => void;
export const serviceReady = new Promise<Service>((resolve) => {
  serviceCreated = resolve;
});

SwaggerExpressMiddleware('swagger.yaml', app, (mwErr, middleware, api) => {
  if (mwErr) throw mwErr;

  app.set('x-powered-by', false);

  app.use(
    middleware.metadata(),
    middleware.CORS(),
    morgan(env.PRODUCTION ? 'combined' : 'dev'),
    middleware.parseRequest(),
    middleware.validateRequest(),
  );

  app.use(errorHandler);

  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(api));

  setRoutes(app as unknown as Router, api);

  const server = app.listen(parseInt(env.SERVER_PORT as string, 10), () => {
    serviceCreated({
      api,
      close: () => {
        pool.end();
        server.close();
      },
    });
    console.log(`listening on ${env.SERVER_PORT}...`);
  });
});
