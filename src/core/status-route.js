'use strict';
const pck = require('../../package.json');
const jwt = require('../auth/jwt-middleware');

function createStatusRoute ({ environment, jwtOptions }) {
  /**
   * Set up /status endpoint.
   * @param  {Object} router A Koa router
   */
  return function statusRoute (router) {
    /**
     * GET /status
     *
     * Returns a simple description of the deployed
     * application. Useful for smoke tests and ping.
     */
    router.get('/status',
      jwt(jwtOptions),
      ctx => {
        ctx.status = 200;
        ctx.body = {
          success: true,
          name: pck.name,
          version: pck.version,
          env: environment,
          timestamp: new Date().toISOString(),
          process: {
            pid: process.pid,
            platform: process.platform,
            mem: process.memoryUsage(),
            cpu: process.cpuUsage()
          }
        };
      });

    return router;
  };
}

module.exports = createStatusRoute;
