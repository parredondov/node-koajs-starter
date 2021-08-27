'use strict';
const { fetchAll } = require('./bulletins-service');
const jwt = require('../auth/jwt-middleware');

function createBulletinsRoute ({ jwtOptions }) {
  /**
   * GET /bulletins
   *
   * Returns a list of public broadcast messages.
   */
  return function bulletinsRoute (router) {
    return router.get('/bulletins', jwt(jwtOptions), async ctx => {
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: await fetchAll()
      };
    });
  };
}

module.exports = createBulletinsRoute;
