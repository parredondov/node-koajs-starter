'use strict';
const { T, identity } = require('ramda');
const yn = require('yn');
const whichRolesCanAccess = require('../auth/roles-access');
const { isNilOrEmpty } = require('../utils/nil-empty');
const castArray = require('../utils/cast-array');

/**
 * Asserts that `ctx.state.user.roles` value is present and it's not empty. `ctx.state.user.roles` should
 * be a single string value or a set of values containing at least one of the roles specified
 * in the `roles` array
 *
 * If the `sub` claim fails validation, `ctx.throw` is called with a `403` HTTP status code.
 *
 * @param {Object} restrictions A map of comma separated resource identifiers to role names. Identifiers
 *  supports globs.
 * @returns {import('koa').Middleware} A Koa middleware function.
 */
const validateRoles = restrictions => {
  const canAccessResource = isNilOrEmpty(restrictions)
    ? // If the given `restrictions` map is `null`, `undefined` or empty
  // do not perform any check and consider any role as being allowed to access
    T
    : whichRolesCanAccess(restrictions);

  /**
   * Checks if the given `restrictions` allow access to the resource being accessed.
   * @param {import('koa').Context} ctx Koa context object
   * @return {import('koa').Context} The context object as-is
   */
  function authorizeAccess (ctx) {
    const user = ctx.state.user;
    const { allow, requires, resource } = canAccessResource(user.roles, ctx.path, {
      method: ctx.method,
      query: ctx.query
    });

    if (!allow) {
      return ctx.throw(401, {
        success: false,
        resource,
        requires,
        found: castArray(user.roles),
        reason: 'User does not have required roles to access this resource'
      });
    }

    return ctx;
  }

  return authorizeAccess;
};

/**
 * Creates and returns a Koa middleware function that performs custom validation of JWT
 * token claims. If the validation fails, a `403 Forbidden` response is returned to the client.
 * This middleware expects `koa-jwt` to have run before it.
 *
 * @see @see https://github.com/koajs/jwt#koa-jwt
 * @param {Object} [options] Middleware options.
 * @param {boolean} [options.passthrough] Whether to disable claims validation or not
 *  (a value of `true` disables validation).
 * @param {Object} [options.restrictions] Roles to resource identifiers map describing API
 *  access restrictions.
 * @returns {import('koa').Middleware} A Koa middleware function that validates JWT claims.
 */
function createJwtClaimsMiddleware (options = {}) {
  const validateClaims =
    options && yn(options.passthrough) === true
      ? // Do not run any claim validations if `passthrough` is `true`
      identity
      : validateRoles(options.restrictions);

  /**
   * Validates claims in a JWT token.
   *
   * @param {import('koa').Context} ctx
   * @param {import('koa').Next} next
   */
  function jwtClaims (ctx, next) {
    // Function below will throw an exception on a failed claim,
    // forcing a `403` HTTP response back to the client
    validateClaims(ctx);
    return next();
  }

  return jwtClaims;
}

module.exports = createJwtClaimsMiddleware;
