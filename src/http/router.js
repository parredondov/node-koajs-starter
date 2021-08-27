'use strict';
const Router = require('@koa/router');
const { compose, concat, dropLastWhile, dropWhile, equals, trim } = require('ramda');
const { isNilOrEmpty } = require('../utils/nil-empty');

/**
 * Returns `true` if the given character/string is a forward slash (`'/'`).
 *
 * @function
 * @param {String} value The string to compare
 * @returns {Boolean} `true` if `value` equals `/`; `false` otherwise.
 */
const equalsSlash = equals('/');

/**
 * Forces the given `path` to start with and remove any trailing
 * `/` (slash character).
 *
 * @function
 * @param {String} path The path to append a `/` if it does not end
 *  in one already.
 * @returns {String} The path ending in `/`.
 */
const ensureAbsolutePath = compose(
  // Append slash at the beginning
  concat('/'),
  // Remove any leading slashes
  // @ts-ignore
  dropWhile(equalsSlash),
  // Remove trailing slashes
  dropLastWhile(equalsSlash),
  trim,
  String
);

/**
 * Thin wrapper around a koa-router that allows setting a `prefix` value
 * to every route while allowing that value to ignore a starting '/' character.
 *
 * @see https://github.com/koajs/router#readme
 * @param {Object} options `koa-router` settings.
 * @returns {import('@koa/router')} A new `koa-router` instance.
 */
function createRouter (options = {}) {
  const routerOptions = {
    ...options,
    prefix: isNilOrEmpty(options.prefix) ? undefined : ensureAbsolutePath(options.prefix)
  };
  return new Router(routerOptions);
}

module.exports = createRouter;
