'use strict';
const { compose, either, reject } = require('ramda');
const castArray = require('./cast-array');
const { isNilOrEmpty } = require('./nil-empty');

/**
 * Removes all `null`, `undefined` and empty values from the given `value`.
 * Definition of "empty" is type dependent.
 *
 * @example
 *  compact([0, 1, null, 2, '', 3, {}]);
 *  // -> [0, 1, 2, 3]
 *
 * @example
 *  compact({ foo: undefined, bar: 42, baz: null });
 *  // -> { bar: 42 }
 *
 * @function
 * @see https://lodash.com/docs/4.17.11#compact
 * @see https://ramdajs.com/docs/#reject
 * @param {*[]|Object} value The value to compact.
 * @returns {*[]} An array or object containing no `null`, `undefined` or
 *  empty elements.
 */
const compact = reject(either(isNilOrEmpty, Number.isNaN));

/**
 * Wraps the given value in an array and removes all `null`, `undefined`
 * and empty values from it. Definition of "empty" is type dependent.
 *
 * @example
 *  compactArray([0, 1, null, 2, '', 3, {}]);
 *  // -> [0, 1, 2, 3]
 *
 * @example
 *  compactArray(null);
 *  // -> []
 *
 * @function
 * @see https://lodash.com/docs/4.17.11#compact
 * @see https://ramdajs.com/docs/#reject
 * @param {*} value The list (or single value) to compact.
 * @returns {*[]} An array or object containing no `null`, `undefined` or
 *  empty elements.
 */
const compactArray = compose(compact, castArray);

module.exports = { compact, compactArray };
