# swagger-api-project

A small REST API project with Node.js + TypeScript, express, Swagger and MySQL.

Swagger use cases are as follows:

- `swagger.yaml` - to define and document handlers
- A Swaggger middleware to parse and validate requests
- A generator to use `swagger.yaml` payload definitions in code
- Setting up routing automatically using Swagger object

## How to run locally?

Simply add a `.env` file (already gitignored) to project root directory like

```
DB_HOST=<host_url>
DB_USER=<username>
DB_PASSWORD=<password>
DB_NAME=<database_name>
```

then

```
$ npm install
$ npm start
```

Default API endpoint is `http://localhost:8080`.
API documentation can be found under `/api-docs` and all methods are under `/v1` like `/v1/ranks`.

## Tests

Since no resources can be created, the tests are optimistic - they just validate `GET` responses.

## Adding a new handler

- First, define a handler in `swagger.yaml` with `operationId: <HandlerName>` along with required definitions in `definitions` and `parameters` section.

- Also add possible error codes to the bottom. If you want to add later, don't forget to run next step again.

- Do `npm run gen` to generate API models again in `models/API.ts`.

- Create handler function in `handlers/<handler_group_name>/<HandlerName>.ts` and add to `handlers/HandlerRegistry.ts`.

- Extend `handlers/Repository.ts` and `repository/Repository.ts` with required methods. A business layer that consumes `Repository` can also be defined.

- Create required DB models in `models/DB.ts`. If model is the same as API object, just define DB model as the same type. If not, it might be useful to add a model transformation to `models/transformations.ts`.
