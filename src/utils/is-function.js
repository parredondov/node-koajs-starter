'use strict';
const { compose, identical, type } = require('ramda');

/**
 * Checks if input value is `Function`.
 *
 * @function
 * @param {*} value The value to test.
 * @returns {Boolean}
 */
const isFunction = compose(identical('Function'), type);

module.exports = isFunction;
