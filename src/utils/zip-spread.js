'use strict';
const { isNil, map, max, range, reduce, zip } = require('ramda');

/**
 * Returns an array of strings of the given `length` where each element
 * is composed of the `baseKey` + the index of the element.
 *
 * @param {string} baseKey The prefix for all generated keys.
 * @param {number} length The number of keys to generate.
 * @returns {string[]} The generated keys.
 */
const generateKeys = (baseKey, length) => map(index => `${baseKey}.${index}`, range(0, length));

/**
 * Generates a flat array of pairs where each first component is a key generated from the given
 * base `key` and an index and the second component is the value of `list` at that index.
 *
 * @example
 *  zipSpread('foo', [1, [2, 3]]); // [['foo[0]', 1], ['foo[1][0]', 2], ['foo[1][1]', 3]]
 *
 * @param {string} key The base key name.
 * @param {*[]} list A list to generate values from (can contain nested lists).
 * @returns {[string, *][]} A flattened list of pairs containing keys named after the given base `key`
 *  followed by an index as the first component.
 */
function zipSpread (key, list) {
  const keys = isNil(list) ? [] : generateKeys(key, max(0, list.length));
  return reduce(
    (entries, [key, value]) =>
      Array.isArray(value) ? [...entries, ...zipSpread(key, value)] : [...entries, [key, value]],
    [],
    zip(keys, list)
  );
}

module.exports = zipSpread;
