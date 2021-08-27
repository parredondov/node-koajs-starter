'use strict';
const { isNotNil } = require('../utils/nil-empty');

/**
 * Creates and returns a middleware function that catches error thrown
 * from the middleware chain and invokes a `handleError` function with it.
 *
 * @param {Function} handleError Error handling function that receives
 *  the thrown error instance and the Koa context object.
 * @returns {import('koa').Middleware} A Koa middleware function that calls `handleError` if
 *  the next middleware in the chain throws an error.
 */
function createTryCatchMiddleware (handleError) {
  return async function tryCatch (ctx, next) {
    try {
      await next();
    } catch (err) {
      if (isNotNil(handleError)) {
        return handleError(err, ctx);
      }

      // If no error handler was defined, just re-throw the error
      // to delegate handling responsibility to other middlewares in the chain
      throw err;
    }
  };
}

module.exports = createTryCatchMiddleware;
