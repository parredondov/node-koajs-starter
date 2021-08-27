'use strict';
const { either, once, prop } = require('ramda');
const yn = require('yn');
const jwt = require('koa-jwt');
const { sign } = require('jsonwebtoken');
const logger = require('../core/logger');

/**
 * Private secret used when the JWT authentication
 * is disabled (by means of `--auth.jwt=false`).
 * @type {String}
 */
const MOCK_SECRET = '8P5EuEhn5r)9$N>*';

/**
 * Creates a custom JWT resolver function that always returns a token for the current running user,
 * that enables access to the file being requested.

 * @returns {Function} A custom resolver function that always return the same signed JWT token
 */
const mockTokenResolver = () => {
  // `require` calls placed here to avoid unnecessarily loading below modules
  // in production environments (or when JWT authentication is enabled)
  const os = require('os');
  const { username } = os.userInfo();

  /**
   * Custom token resolver that always returns a token for the user running the service.
   * Useful for development environments.
   *
   * @params {Object} `ctx` object passed to the middleware.
   * @param {Object} opts
   * @return {String} The resolved JWT token .
   */
  return function getToken (ctx, { secret }) {
    const nowUnix = Math.floor(Date.now() / 1000);
    return sign(
      {
        env: process.env.NODE_ENV,
        iat: nowUnix,
        sub: username,
        aud: ctx.request.path,
        // Set expiration date to a week from now
        exp: nowUnix + 604800,
        roles: ['admin']
      },
      secret
    );
  };
};

/**
 * Checks middleware options to determine if the authentication mechanism was
 * disabled or not.
 *
 * @function
 * @param {Object} options Middleware options
 * @returns {Boolean}
 */
const isAuthenticationDisabled = either(prop('mocked'), prop('passthrough'));

const buildOptionsFrom = (options = {}) => {
  return yn(options) === false
    ? {
      // Ad-hoc option to signal that this middleware
      // was configured to used fake credentials
      mocked: true,
      secret: MOCK_SECRET,
      getToken: mockTokenResolver()
    }
    : {
      ...options,
      passthrough: yn(options.passthrough)
    };
};

/**
 * @function
 */
const warnIfDisabled = once(options => {
  if (isAuthenticationDisabled(options)) {
    logger.warn('JWT authentication has been disabled by options');
  }
});

/**
 * Configures and returns a JSON Web Token middleware
 * with some pre-defined login routes excluded.
 *
 * @see https://github.com/koajs/jwt#koa-jwt
 * @param {Object|Boolean} options Middleware options. If `false` authentication
 * will be resolved using fake credentials.
 * @returns {import('koa').Middleware} A Koa middleware function.
 */
function createJwtMiddleware (options = {}) {
  const middlewareOptions = buildOptionsFrom(options);
  warnIfDisabled(middlewareOptions);
  return jwt(middlewareOptions);
}

module.exports = createJwtMiddleware;
