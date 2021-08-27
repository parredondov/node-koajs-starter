'use strict';
const { compose, head, join, map, memoizeWith, sort, subtract, toPairs } = require('ramda');
const buildYupSchema = require('./yup-schema-builder');
const { isNotNilOrEmpty } = require('../utils/nil-empty');
const isFunction = require('../utils/is-function');

/**
 * Dynamically generate a `yup` schema based on an array of `fields` descriptors present
 * at `ctx.state.fields`, which must be set before calling this middleware.
 * The schema is then set to `ctx.state.schema`.
 *
 * @param {Object[]|Function} fieldsOrFunction
 * @returns {import('koa').Middleware} A Koa middleware function.
 */
function createYupSchemaMiddleware (fieldsOrFunction) {
  const serialize = compose(join(';'), map(join(':')), sort(head), toPairs);

  // Serializes fields using their ids and validations into a single stable string
  const genKey = compose(
    join('_'),
    sort(subtract),
    // @ts-ignore
    map(({ id, validations }) => `${id}:${serialize(validations)}`)
  );

  // Cache returned schema and only re-generate it if new `fields` are passed in
  const generateSchema = memoizeWith(genKey, buildYupSchema);

  /**
   *
   * @param {import('koa').Context} ctx The Koa context object.
   * @param {import('koa').Next} next The Koa `next` callback.
   */
  async function generateYupSchema (ctx, next) {
    // @ts-ignore
    const fields = isFunction(fieldsOrFunction) ? await fieldsOrFunction(ctx) : fieldsOrFunction;

    if (isNotNilOrEmpty(fields)) {
      ctx.state = ctx.state || {};
      ctx.state.schema = generateSchema(fields);
    }

    return next();
  }

  return generateYupSchema;
}

module.exports = createYupSchemaMiddleware;
