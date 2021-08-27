'use strict';
const { createServer } = require('http');
const log = require('../core/logger');
const onShutdown = require('./shutdown');
const createKoa = require('./koa');

const start = (server, { environment, host, port }) => {
  return server.listen({ host, port }, () => {
    const { address, port } = server.address();
    log.info(`✔ Web server listening on ${address}:${port} [${environment}]`);
    // Notify parent process that the application is ready to accept connections
    // Useful if using process managers such as PM2
    // See https://pm2.io/doc/en/runtime/best-practices/graceful-shutdown/#graceful-start
    // Also, `process.send` may be undefined if Node.js was not spawned with an IPC channel
    // See https://nodejs.org/api/process.html#process_process_send_message_sendhandle_options_callback
    process.send && process.send('ready');
  });
};

const close = server => {
  return server.close(err => {
    if (err) {
      log.error(`✘ Web server failed to shut down successfully: ${err.message}`);
      return process.exit(1);
    }
    log.info('✘ Web server shut down successfully');
  });
};

/**
 * Wraps a Koa application in an HTTP server that
 * listens to incoming requests and directs them to its routes.
 *
 */
function startServer (config = {}) {
  // Create a configured Koa app instance
  const app = createKoa(config);

  // Create http server that listens to Koa routes
  const server = createServer(app.callback());

  // Configure shutdown handler
  onShutdown(() => close(server));

  return start(server, { ...config.http, environment: config.env });
}

module.exports = startServer;
