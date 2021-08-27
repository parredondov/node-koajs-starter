'use strict';
const { of, unless } = require('ramda');

/**
 * Wraps any value in an `Array` if it's not already one.
 *
 * @example
 *  castArray(42); // -> [42]
 *  castArray([42]); // -> [42]
 *  castArray(['foo', 'bar']); // -> ['foo', 'bar']
 *
 * @function
 * @see https://ramdajs.com/docs/#of
 * @param {*} value The value to wrap
 * @returns {*[]} An `Array` containing the given `value`
 *  or the same input if it was already an `Array`.
 */
const castArray = unless(Array.isArray, of);

module.exports = castArray;
