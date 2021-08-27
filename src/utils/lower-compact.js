'use strict';
const { compose, map, uniq } = require('ramda');
const { compactArray } = require('./compact');
const lowerTrim = require('./lower-trim');

/**
 * Removes all `undefined`, `null` or empty values from the given `listOrString`
 * and transforms all of its elements to lower case. Duplicate elements are filtered.
 *
 * @function
 * @param {string[]|string} listOrString The array or single element to update.
 *  Will be coerced into an `Array`.
 * @returns {string[]} A new compact list with all of its elements
 *  transformed to lower case.
 */
const lowerCompact = compose(uniq, map(lowerTrim), compactArray);

module.exports = lowerCompact;
