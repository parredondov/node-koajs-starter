'use strict';
const { compose, curryN, intersection, isEmpty, map, not, toLower, useWith } = require('ramda');
const castArray = require('./cast-array');
const { rejectNilOrEmpty } = require('./reject-nil');

/**
 * Converts all elements in an array to lowercase. Each element
 * is coerced into a `String`, if it's not already one. All `undefined` and
 * `null` values will be removed from the output.
 *
 * @example
 *  allToLower(['Foo', null, 'bAr']); // ['foo', bar']
 *
 * @function
 * @param {Array.<String>|String} values The values to convert to lowercase. A
 *  single value will be wrapped in an array.
 * @returns {Array.<String>} All the passed `values`, down cased.
 */
const allToLower = curryN(1, compose(map(compose(toLower, String)), rejectNilOrEmpty, castArray));

/**
 * Checks if a string value (or set of values) is present in another.
 * The comparison between elements is case insensitive. `null` and
 * `undefined` values are ignored.
 *
 * @example
 *  const isVeggie = isOneOf(['carrot', 'cucumber', 'parsnip']);
 *  isVeggie('tuna'); // false
 *
 * @function
 * @see https://ramdajs.com/docs/#intersection
 * @param {Array.<String>|String} firstSet The first set of elements (or single element) to check.
 * @param {Array.<String>|String} secondSet The second set of elements (or single element) to check.
 * @returns {Boolean} `true` if at least one element on `firstSet` is present in `secondSet`.
 */
const isOneOf = curryN(2, compose(not, isEmpty, useWith(intersection, [allToLower, allToLower])));

module.exports = isOneOf;
