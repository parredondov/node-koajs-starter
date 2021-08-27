'use strict';
const { compose, filter, keys } = require('ramda');

/**
 * Returns all keys in the given object pointing to
 * truthy values.
 *
 * @example
 *  truthyKeys({ foo: true, bar: false }); // ['foo']
 *
 * @function
 * @param {Object} obj The object to extract keys from.
 * @returns {Array.<String>} A list of properties from the provided object that were
 *  assigned to truthy values.
 */
const truthyKeys = compose(keys, filter(Boolean));

module.exports = truthyKeys;
