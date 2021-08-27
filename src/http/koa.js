'use strict';
const { omit } = require('ramda');
const Koa = require('koa');
const compress = require('koa-compress');
const cors = require('@koa/cors');
const error = require('koa-json-error');
const helmet = require('koa-helmet');
const json = require('koa-json');
const morgan = require('koa-morgan');
const responseTime = require('koa-response-time');
const logger = require('../core/logger');
const createRouter = require('./router');
const declareRoutes = require('./routes');

/**
 * Bootstraps and configures a Koa application to be used as a GraphQL API.
 *
 * @param {Object} config Middleware configuration and options.
 * @returns {Koa} A Koa app instance.
 */
function createKoa (config = {}) {
  // Create Koa app instance
  const app = new Koa();
  // Declare and configure global middlewares
  app.use(error({ postFormat: (_, err) => omit(['stack', 'expose', 'statusCode'], err) }));
  app.use(morgan(config.morgan.format));
  app.use(responseTime());
  app.use(helmet(config.helmet));
  app.use(compress(config.compress));
  app.use(cors(config.cors));
  app.use(json(config.json));
  app.on('error', err => {
    logger.error(`Unexpected error: ${err.reason || err.message}`);
    logger.debug(err.stack);
  });

  // Declare API routes
  const router = createRouter(config.http);
  declareRoutes(config, router);
  app.use(router.routes(), router.allowedMethods({ throw: true }));

  return app;
}

module.exports = createKoa;
