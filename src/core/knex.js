'use strict';
const { omit } = require('ramda');
const knex = require('knex');
const onShutdown = require('../http/shutdown');
const config = require('../config');
const logger = require('../core/logger');

// Initialize and export an instance of `knex` running as a mysql
// client using configured settings
// See http://knexjs.org/
const mysql = knex({
  client: 'mysql',
  connection: omit(['pool', 'debug'], config.mysql),
  pool: config.mysql.pool,
  debug: config.mysql.debug,
  acquireConnectionTimeout: 15000,
  log: {
    warn (message) {
      return logger.warn(message);
    },
    error (message) {
      return logger.error(message);
    },
    deprecate (message) {
      return logger.debug(message);
    },
    debug (message) {
      return logger.debug(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }
});

// Listen for TERM (e.g. kill) and INT (e.g. Ctrl+C) signals
// and close all connections on the pool
onShutdown(() => {
  logger.info('[mysql] Closing mysql connection pool');
  return mysql.destroy();
});

module.exports = mysql;
