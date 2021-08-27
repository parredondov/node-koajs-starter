'use strict';
const { omit } = require('ramda');
const config = require('./src/config');

module.exports = {
  mysql: {
    client: 'mysql',
    connection: omit(['pool', 'debug'], config.mysql),
    pool: config.mysql.pool,
    seeds: {
      extension: 'js',
      stub: './knex/knex-seed-stub.js',
      directory: './knex/seeds'
    },
    migrations: {
      extension: 'js',
      stub: './knex/knex-migration-stub.js',
      directory: './knex/migrations',
      tableName: 'knex_migration'
    }
  }
};
