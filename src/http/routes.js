'use strict';
const { applyTo, compose, curry } = require('ramda');
const statusRoute = require('../core/status-route');
const tokenRoute = require('../auth/token-route');

/**
 * Configures and declares all application routes on the given `router`
 * instance.
 *
 * @param {Object} config A configuration object containing needed routes settings.
 * @param {import('koa-router')} router A `@koa/router` instance.
 * @return {import('koa-router')} The given `router` instance with all routes declared on it.
 */
function declareRoutes (config, router) {
  return applyTo(
    router,
    compose(
      tokenRoute({
        jwtOptions: config.auth.jwt,
        remoteAuthOptions: config.auth.remote,
        environment: config.env
      }),
      statusRoute({ environment: config.environment, jwtOptions: config.auth.jwt })
    )
  );
}

module.exports = curry(declareRoutes);
