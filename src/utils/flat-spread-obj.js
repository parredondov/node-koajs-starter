'use strict';
const { compose, fromPairs, isNil, map, toPairs, unless, unnest } = require('ramda');
const zipSpread = require('./zip-spread');

/**
 * Traverses each key/value on an object and creates a new one by applying
 * `zipSpread` to every `Array` value and spreading the resulting pairs. Does not
 * support nested objects.
 *
 * @example
 *  flatSpreadObj({ foo: [1, 2], bar: 3 }); // {  'foo[0]': 1, 'foo[1]': 2, bar: 3 }
 *
 * @function
 * @param {Object} obj The object to spread arrays from.
 * @returns {Object.<string, *>} A new object where each key represents the original key in `obj` followed by
 *  an index in the case of list values, and the values are either the original value from `obj`
 *  or the element at the corresponding index in case of lists.
 */
const flatSpreadObj = unless(
  isNil,
  compose(
    fromPairs,
    unnest,
    map(([key, value]) => (Array.isArray(value) ? zipSpread(key, value) : [[key, value]])),
    toPairs
  )
);

module.exports = flatSpreadObj;
