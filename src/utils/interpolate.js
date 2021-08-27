'use strict';
const {
  call,
  compose,
  curry,
  flip,
  mapObjIndexed,
  reduce,
  replace,
  take,
  values
} = require('ramda');
const escapeStringRegexp = require('escape-string-regexp');
const { rejectNil } = require('./reject-nil');

/**
 * @function
 */
const sanitizeSymbol = compose(escapeStringRegexp, replace(/[^-a-z0-9._/\\]/, ''), take(256));

const replacer = compose(
  values,
  // RegExp literal already sanitized
  // eslint-disable-next-line security/detect-non-literal-regexp
  mapObjIndexed((value, key) => replace(new RegExp(`{${sanitizeSymbol(key)}}`, 'g'), value)),
  rejectNil
);

/**
 * Replaces variables in a template enclosed by `{}`. Variable names
 * will be escaped for safe regular expression usage and, for safety reasons,
 * cannot exceed `512` characters in length.
 *
 * @examples
 *  interpolate('I am {name}', { name: 'Error' });
 *  // 'I am Error'
 *
 * @param {String} template The template to interpolate.
 * @param {Object} context The values to replace in `template.
 * @returns {String} The result of resolving template interpolation
 *  with the given `context`.
 */
function interpolate (template, context) {
  return reduce(flip(call), template, replacer(context));
}

module.exports = curry(interpolate);
