'use strict';
const { curry, join, max, repeat } = require('ramda');

/**
 * Returns a string of containing the specified identical `value`
 * repeated `times` times.
 *
 * @example
 *  repeatString('*', 5); // '*****'
 *
 * @see https://ramdajs.com/docs/#repeat
 * @param {*} value The value to repeat. Will be coerced into a `String`.
 * @param {Number} times The desired length of the output string.
 * @returns {String} A string containing `value` repeated `times` times.
 */
function repeatString (value, times) {
  return join('', repeat(String(value), max(Number(times), 0)));
}

module.exports = curry(repeatString);
