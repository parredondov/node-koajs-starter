'use strict';
const { compose, isNil, split, trim, unless } = require('ramda');
const { rejectNilOrEmpty } = require('./reject-nil');

/**
 * Splits a comma delimited string value into tokens, ignoring white spaces.
 *
 * @example
 *  splitByComma('foo,  bar  , baz, ,'); // ['foo', 'bar', 'baz']
 *
 * @function
 * @param {*} value Value to split (will be coerced into a `String`).
 * @returns {string[]|undefined} A list of tokens delimited by commas in the given `value`.
 */
const splitByComma = unless(isNil, compose(rejectNilOrEmpty, split(/\s*,\s*/), trim, String));

module.exports = splitByComma;
