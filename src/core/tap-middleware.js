'use strict';
const logger = require('./logger');

/**
 * Taps into a middleware chain by invoking an arbitrary `fn` function
 * with the Koa `ctx` object. Any returned value or error thrown during its
 * execution will be ignored.
 *
 * @param {Function} fn Function to be invoked with the Koa `ctx` object.
 * @returns {import('koa').Middleware} A Koa middleware function that executes `fn` and proceeds
 *  with the next middleware in the chain.
 */
function createTapMiddleware (fn) {
  return function tap (ctx, next) {
    try {
      fn && fn(ctx);
    } catch (err) {
      // Swallow any errors that may have arose from `fn`
      // to avoid disruption of middleware chain
      logger.warn(
        `Ignoring unexpected error from 'tap' function: ${err.stack || err.message || err}`
      );
    }

    return next();
  };
}

module.exports = createTapMiddleware;
