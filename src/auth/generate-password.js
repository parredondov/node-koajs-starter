'use strict';
const {
  applySpec,
  compose,
  either,
  equals,
  gte,
  identical,
  ifElse,
  last,
  map,
  pick,
  prop,
  reject,
  repeat,
  toPairs,
  type,
  unnest
} = require('ramda');
const pwd = require('secure-random-password');

/**
 * @function
 */
const isBoolean = compose(identical('Boolean'), type);

/**
 * @function
 */
const isObject = compose(identical('Object'), type);

const randomInt = ({ max = 32, min = 8 } = {}) => {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;
};

/**
 * Default options for generating passwords using `sercure-random-password`.
 *
 * @type {Object}
 */
const DEFAULT_OPTIONS = Object.freeze({
  length: 8,
  digits: 2,
  symbols: 1,
  upper: 1,
  lower: true
});

/**
 * @function
 */
const defineOptions = applySpec({
  length: compose(ifElse(isObject, randomInt, Number), prop('length')),
  characters: compose(
    unnest,
    map(([charset, atLeast]) => {
      // `charset` can only be one of 'digits', 'symbols', 'upper' or 'lower'
      // eslint-disable-next-line security/detect-object-injection
      const characters = pwd[charset];
      return isBoolean(atLeast) ? characters : repeat(characters, atLeast);
    }),
    // Remove all charsets that were set to `false`, `0` or a negative number
    // (i.e.: `numbers: false` or `digits: 0`)
    reject(compose(either(gte(0), equals(false)), last)),
    toPairs,
    pick(['digits', 'symbols', 'upper', 'lower'])
  )
});

/**
 * Generate a random password that follows the given policies.
 *
 * @see https://github.com/mkropat/secure-random-password#usage
 * @param {Object=} options Password generation options.
 * @param {Number|Object=} options.length The length of the generated password. If an object is given,
 *  it should contain `min` and `max` properties describing a range of allowed lengths.
 * @param {Number|Boolean=} options.digits Whether to include digits [0-9] in the password
 *  or not. If a number is passed, at least that number of digits will be included in the output.
 * @param {Number|Boolean=} options.symbols Whether to include symbols [!@#$%^&*()] in the password
 *  or not. If a number is passed, at least that number of symbols will be included in the output.
 * @param {Number|Boolean=} options.upper Whether to include uppercase letters [A-Z] in the password
 *  or not. If a number is passed, at least that number of letters will be included in the output.
 * @param {Number|Boolean=} options.lower Whether to include lowercase letters [a-z] in the password
 *  or not. If a number is passed, at least that number of letters will be included in the output.
 * @returns {String} A random password.
 */
function generatePassword (options) {
  return pwd.randomPassword(defineOptions({ ...DEFAULT_OPTIONS, ...options }));
}

module.exports = generatePassword;
