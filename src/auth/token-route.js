'use strict';
const { compose, omit, prop } = require('ramda');
const { URL } = require('url');
const { isNilOrEmpty } = require('../utils/nil-empty');
const generateJwt = require('./generate-jwt');
const logger = require('../core/logger');
const bodyParser = require('koa-bodyparser');
const { login } = require('../auth/auth-service');

function createTokenRoute ({ environment, jwtOptions, ldapOptions, remoteAuthOptions }) {
  /**
   * @function
   */
  const extractHostname = compose(prop('hostname'), uri => new URL(uri));

  /**
   * @function
   */
  const cleanJwtOptions = omit(['secret', 'cookie', 'passthrough', 'getToken']);

  /**
   * Set up /token endpoint.
   * @param  {Object} router A Koa router
   */
  return function tokenRoute (router) {
    /**
     * GET /token
     */
    return router.post(
      '/token',
      bodyParser(),
      async ctx => {
        const authUser = await login(ctx.request.body);
        if (authUser) {
          const user = authUser;
          const origin = ctx.get('origin');
          const token = await generateJwt(user, jwtOptions.secret, {
            // The environment this token is meant for
            environment,
            // The "iss" (issuer) claim identifies the principal that issued the JWT
            issuer: ctx.hostname,
            // The "aud" (audience) claim identifies the recipients that the JWT is intended for
            audience: isNilOrEmpty(origin) ? '' : extractHostname(origin),
            ...cleanJwtOptions(jwtOptions)
          });

          logger.info(
            `Generated new authentication token for remote user [username='${
              user.sAMAccountName
            }', displayName='${user.displayName}', roles=${JSON.stringify(user.roles)}]`
          );
          ctx.status = 200;
          ctx.body = {
            success: true,
            token
          };
        } else {
          ctx.status = 400;
          ctx.body = {
            success: false,
            message: 'Las credenciales no coinciden'
          };
        }
      }
    );
  };
}

module.exports = createTokenRoute;
