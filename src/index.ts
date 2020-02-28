import * as dotenv from 'dotenv';
import { createPool, PoolConfig } from 'mysql';
import * as express from 'express';
import SwaggerExpressMiddleware from 'swagger-express-middleware';
import swaggerUI from 'swagger-ui-express';
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

const app = express.default();
app.on('error', (err) => {
  console.log(err);
  console.log('caught error');
});

SwaggerExpressMiddleware('swagger.yaml', app, (mwErr, middleware, api) => {
  if (mwErr) throw mwErr;

  app.use(
    middleware.metadata(),
    middleware.CORS(),
    middleware.parseRequest(),
    middleware.validateRequest(),
  );

  // if (env.TESTING) app.use(middleware.mock());

  app.use(errorHandler);

  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(api));

  setRoutes(app as unknown as Router, api);

  const port = env.SERVER_PORT || 8080;

  app.listen(port, () => {
    console.log(`listening on ${port}`);
  });
});
