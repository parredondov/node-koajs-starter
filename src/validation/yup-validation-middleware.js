'use strict';
const { converge, mergeDeepRight, pathOr, propOr, reduce, unapply } = require('ramda');
const { isNotNil } = require('../utils/nil-empty');
const isFunction = require('../utils/is-function');
const extractYupErrors = require('./yup-extract-errors');

/**
 * @function
 */
const mergeDeepAll = reduce(mergeDeepRight, {});

/**
 * Merges together the values from `request.body`, `params` and `request.query`
 * from the given object. All three properties are optional. Values on `request.body` have prevalence
 * over `params` and `request.query`; while `params` properties have priority over `request.query`.
 *
 * @function
 * @param {Object} ctx The Koa context object containing `request` and `params` properties.
 * @returns {Object} A single object with the values of the three properties merged.
 */
const extractRequestData = converge(unapply(mergeDeepAll), [
  pathOr({}, ['request', 'body']),
  propOr({}, 'params'),
  pathOr({}, ['request', 'query'])
]);

/**
 * Validates the request against a `yup` schema and responds with a `400` HTTP response
 * if it doesn't pass the test.
 *
 * @see https://github.com/jquense/yup
 * @param {Object|Function} yupSchemaOrFunction A `yup` schema descriptor or a schema returning function
 *  (can be `async`). As a function, it takes the Koa context object as a single argument.
 * @param {Object} [options] Configuration options.
 * @param {number} [options.status=400] HTTP status to return if validation fails (defaults to 400).
 * @param {Function} [options.runValidationOn] A function that receives the Koa context object
 *  and should return an object to validate. Defaults to run validation on `ctx.request.body`, `ctx.params`
 *  and `ctx.request.query`.
 * @returns {import('koa').Middleware} A Koa middleware function.
 */
function createYupValidationMiddleware (
  yupSchemaOrFunction,
  { status = 400, runValidationOn = extractRequestData } = {}
) {
  /**
   *
   * @param {import('koa').Context} ctx The Koa context object.
   * @param {import('koa').Next} next The Koa `next` callback.
   */
  async function yupValidation (ctx, next) {
    const yupSchema = isFunction(yupSchemaOrFunction)
      ? await yupSchemaOrFunction(ctx)
      : yupSchemaOrFunction;

    if (isNotNil(yupSchema)) {
      try {
        await yupSchema.validate(runValidationOn(ctx), { abortEarly: false });
      } catch (err) {
        const errors = extractYupErrors(err);
        return ctx.throw(status, { errors });
      }
    }

    return next();
  }

  return yupValidation;
}

module.exports = createYupValidationMiddleware;
