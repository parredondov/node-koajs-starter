'use strict';
const {
  either,
  identity,
  isNil,
  memoizeWith,
  replace,
  toLower,
  toUpper,
  trim,
  unless
} = require('ramda');
const logger = require('../core/logger');
const { isNilOrEmpty } = require('../utils/nil-empty');
const lowerEquals = require('../utils/lower-equals');

/**
 * @type {String}
 */
const DEFAULT_REMOTE_USER_HEADER = 'X-Remote-User';

/**
 * @type {String}
 */
const DEFAULT_REMOTE_USER_ENV_VAR = 'REMOTE_USER';

/**
 * Remove any character other than digits, letters and underscores.
 * @function
 */
const sanitizeEnvVar = unless(isNil, replace(/[^a-z0-9_]/gi, ''));

/**
 * Checks whether the given `remoteUser` is `null`, `undefined`, empty or the
 * string `'(null)'` which is a typical value for compliant web servers to set
 * when there was some kind of error handling or setting remote authentication.
 *
 * @function
 * @param {String} remoteUser
 * @returns {Boolean}
 */
const invalidOrMissingRemoteUser = either(isNilOrEmpty, lowerEquals('(null)'));

/**
 * Reads a variable value from the existing `process.env` ignoring case (i.e.: `Foo` will
 * also look for `FOO` and `foo`).
 *
 * @param {String} envVar Name of the environment variable to read.
 * @returns {String|undefined} The value of the environment variable or `undefined` if it
 * wasn't defined.
 */
// @ts-ignore
const fromEnv = memoizeWith(identity, envVar => {
  const safeEnvVar = sanitizeEnvVar(envVar);
  return (
    // Environment variable name sanitized above
    // eslint-disable-next-line security/detect-object-injection
    process.env[safeEnvVar] || process.env[toLower(safeEnvVar)] || process.env[toUpper(safeEnvVar)]
  );
});

function createRemoteAuthMiddleware ({ remoteUserEnvVar, remoteUserHeaderName }) {
  const headerName = isNilOrEmpty(remoteUserHeaderName)
    ? DEFAULT_REMOTE_USER_HEADER
    : trim(remoteUserHeaderName);

  const envVar = isNilOrEmpty(remoteUserEnvVar)
    ? DEFAULT_REMOTE_USER_ENV_VAR
    : trim(remoteUserEnvVar);

  /**
   * Koa middleware function that checks for both, a `REMOTE_USER` environment variable and
   * an `X-Remote-User` HTTP header and pulls a use entry from LDAP based on the username provided
   * in either of them. If no user was found, a `401 (Unauthorized)` HTTP response is returned.
   *
   * @param {import('koa').Context} ctx The Koa context object.
   * @param {import('koa').Next} next The Kon `next` callback.
   */
  async function remoteAuth (ctx, next) {
    ctx.state = ctx.state || {};
    const remoteUser = fromEnv(envVar) || ctx.get(headerName);

    if (invalidOrMissingRemoteUser(remoteUser)) {
      // Neither X-Remote-User header nor REMOTE_USER environment variables
      // were set, return 401 (Unauthorized)
      return ctx.throw(401, {
        success: false,
        remoteUser,
        reason: `Remote user was not found or invalid (must be set through either a '${headerName}' header or a '${toUpper(
          envVar
        )}' environment variable)`
      });
    }

    try {
      // const ldapUser = await searchSingleUser(remoteUser, { withRoles: true });
      // // Attach read-only user to context so other middlewares up the chain can read it
      ctx.state.user = Object.freeze('parredondo');
      return next();
    } catch (err) {
      logger.error(
        `An error occurred while searching LDAP user [username=${remoteUser}]: ${err.stack}`
      );
      // LDAP authentication failed, return 401 (Unauthorized)
      return ctx.throw(401, {
        success: false,
        username: remoteUser,
        reason: err.message
      });
    }
  }

  return remoteAuth;
}

module.exports = createRemoteAuthMiddleware;
