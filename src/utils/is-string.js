'use strict';
const { both, either, is } = require('ramda');
const { isNotNil } = require('./nil-empty');

/**
 * Checks whether a given `value` is a `String` or not.
 *
 * @function
 * @param {*} value The value to check
 * @returns {Boolean} `true` if `value` is a string; `false`, otherwise.
 */
const isString = both(
  isNotNil,
  either(is(String), value => typeof value === 'string')
);

module.exports = isString;
