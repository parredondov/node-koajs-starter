'use strict';
const { always } = require('ramda');
const cacheFor = require('../core/cache-for');
const isFunction = require('../utils/is-function');

/**
 * Caches some data and sets it in the Koa `ctx`.
 *
 * @param {Function} fn Async function returning some arbitrary data. Receives the Koa `ctx` object as argument.
 * @param {Function|string} keyFnOrString A string key or a key returning function.
 * @param {Function} setterFn A function that takes in the Koa `ctx` object and the data returned by `fn` and is expected
 *  to set its value somewhere in `ctx`.
 * @param {Object} [options] Middleware options.
 * @param {number|string} [options.expiresIn='10m'] Time data will be cached
 *  (follows `ms` module format, see https://github.com/zeit/ms#readme).
 */
function createCacheMiddleware (fn, keyFnOrString, setterFn, { expiresIn } = {}) {
  const keyFn = isFunction(keyFnOrString) ? keyFnOrString : always(keyFnOrString);

  /**
   * Fetches arbitrary data returned by an `fn` function and caches it for
   * a configured amount of time.
   *
   * @async
   * @function
   */
  // @ts-ignore
  const fetchData = cacheFor(keyFn, fn, { expiration: expiresIn });

  /**
   *
   * @param {import('koa').Context} ctx The Koa context object.
   * @param {import('koa').Next} next The Kon `next` callback.
   */
  async function cache (ctx, next) {
    const data = await fetchData(ctx);
    setterFn(ctx, data);
    return next();
  }

  return cache;
}

module.exports = createCacheMiddleware;
