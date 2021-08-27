'use strict';
const { compose, fromPairs, map, propOr } = require('ramda');
const castArray = require('../utils/cast-array');
const { isNilOrEmpty } = require('../utils/nil-empty');

/**
 * @function
 */
const extractInnerErrors = compose(
  fromPairs,
  map(({ message, path }) => [path, message]),
  propOr([], 'inner')
);

/**
 * Pulls validation errors information from the given `yup` error object.
 *
 * @param {Error} err A `yup` validation error.
 * @returns {Array.<String>|Object} A map of properties to validation error messages
 *  or an array of validation messages.
 */
function extractYupErrors (err) {
  const errors = extractInnerErrors(err);
  return isNilOrEmpty(errors) ? castArray(err.message) : errors;
}

module.exports = extractYupErrors;
