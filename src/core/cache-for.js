'use strict';
const { isNil, nAry } = require('ramda');
const ms = require('ms');

/**
 * Default amount of time the data will be cached before considering
 * it stale and a re-fetch occurs.
 * @type {string}
 * @constant
 */
const DEFAULT_CACHE_EXPIRATION = '10m';

const expired = (lastCallAt, expiresAfter) => Date.now() - lastCallAt > expiresAfter;

/**
 * Accepts an async function `fn` and a key returning function `keyFn` and
 * returns another function that guards invocation of `fn` such that `fn` can only ever
 * be called once after a successfully invocation (i.e.: an error was not thrown), no matter
 * how many times the returned function is invoked, until `expiration` time has passed.
 *
 * The first actual value, resolved from a non-throwing call to `fn`, is returned in subsequent invocations.
 *
 * @function
 * @param {Function} keyFn A key returning function. May return a `Promise`.
 * @param {Function} fn The async function to whose resolved value is to be cached.
 * @param {Object} [options]
 * @param {string|number} [options.expiration='10m']
 * @return {Function} The wrapped async function.
 */
function cacheFor (keyFn, fn, { expiration = DEFAULT_CACHE_EXPIRATION } = {}) {
  const cache = new Map();
  // @ts-ignore
  const expiresAfter = ms(expiration);

  return nAry(fn.length, async function callIfNeeded (...args) {
    const key = await keyFn(...args);
    const entry = cache.get(key);

    if (isNil(entry) || expired(entry.lastCallAt, expiresAfter)) {
      const data = await fn(...args);
      // Fetch (or re-fetch) value if it has become stale or if we are
      // calling the fetching function for the first time
      cache.set(key, { data: Object.freeze(data), lastCallAt: Date.now() });

      return data;
    }

    // If cache value is still valid (i.e.: did not expire), return it
    return entry.data;
  });
}

module.exports = cacheFor;
