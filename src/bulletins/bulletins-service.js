'use strict';
const { applySpec, compose, isNil, map, prop } = require('ramda');
const lowerTrim = require('../utils/lower-trim');
const knex = require('../core/knex');

/**
 * @function
 */
const toBulletin = applySpec({
  id: prop('id'),
  issuer: prop('issuer'),
  message: prop('message'),
  createdAt: prop('created_at'),
  transform: compose(lowerTrim, prop('text_transform')),
  style: compose(lowerTrim, prop('text_style')),
  size: compose(lowerTrim, prop('text_size')),
  color: compose(lowerTrim, prop('text_color')),
  background: compose(lowerTrim, prop('background_color'))
});

/**
 * Fetches all enabled bulletin messages, sorted by creation date.
 *
 * @async
 * @param {Object=} options
 * @param {Number=} options.limit Maximum number of bulletins to return (defaults to 50).
 * @returns {Array.<Object>} A set of bulletins
 */
async function fetchAll ({ limit = 50 } = {}) {
  const res = await knex('bulletin')
    .where('enabled', true)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .timeout(15000, { cancel: true });

  return isNil(res) ? [] : map(toBulletin, res);
}

module.exports = { fetchAll };
