'use strict';
const { compose, fromPairs, map, toPairs } = require('ramda');

/**
 * @function
 */
const toPromisesOfPairs = compose(
  map(([key, value]) => Promise.resolve(value).then(res => [key, res])),
  toPairs
);

/**
 * Returns a promise that is fulfilled when all the properties of the object values are fulfilled.
 *
 * @async
 * @param {Object} obj A map of keys and `Promise`s.
 * @returns {Promise.<Object>} An object whose properties point to their resolved values.
 */
async function promiseProps (obj) {
  const promises = toPromisesOfPairs(obj);
  const pairsOfValues = await Promise.all(promises);
  return fromPairs(pairsOfValues);
}

module.exports = promiseProps;
