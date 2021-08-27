'use strict';

const { compose, differenceWith, eqBy, toLower } = require('ramda');

/**
 * @function
 */
const differenceIgnoreCase = differenceWith(eqBy(compose(toLower, String)));

module.exports = differenceIgnoreCase;
