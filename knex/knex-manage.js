#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';
const boolify = require('yn');
const { EOL } = require('os');
const yargs = require('yargs');
const util = require('util');
const mysql = require('mysql');
const chalk = require('chalk');
const log = require('log-update');
const symbols = require('log-symbols');
const prompt = require('prompt');
const ms = require('ms');
const pck = require('../package.json');
const onceIfOk = require('../src/utils/once-ok');
const knexfile = require('../knexfile');

/**
 * Fetches a new connection. Once connection has been established,
 * subsequent calls to this function will always return the same
 * client instance.
 *
 * @async
 * @function
 * @param {string|import('mysql').ConnectionConfig} connectionUriOrConfig Connection URI or settings.
 * @returns {Promise<import('mysql').Connection>}
 */
const acquireConnection = onceIfOk(async function acquireConnection (connectionUriOrConfig) {
  const client = mysql.createConnection(connectionUriOrConfig);
  const connect = util.promisify(client.connect.bind(client));
  await connect();
  return client;
});

/**
 * Closes active mysql connection.
 * @async
 * @returns {Promise.<void>}
 */
async function closeConnection () {
  const client = await acquireConnection();
  client.destroy();
}

/**
 * Executes the given SQL query.
 * @param {string} sql Query to execute.
 * @param {*[]} [bindings] Query values.
 * @returns {Promise<import('mysql').Connection>}
 */
async function execute (sql, bindings) {
  const client = await acquireConnection();
  const query = util.promisify(client.query.bind(client));
  await query(sql, bindings);
  return client;
}

/**
 * Creates a new database using the given `dbName`
 *
 * @async
 * @param {string} dbName Name of the database to create.
 */
function createDatabase (dbName) {
  execute('DROP DATABASE IF EXISTS ??', [dbName]);
  return execute('CREATE DATABASE ?? DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci', [
    dbName
  ]);
}

/**
 * Creates a new mysql user.
 *
 * @async
 * @param {string} user The owner username.
 * @param {string} password Password the new user should be identified by.
 */
function createDatabaseOwnerIfNotExist (user, password) {
  // Use `mysql_native_password` explicitly since `mysqljs` driver does not
  // support default MySQL 8.0+ password encryption
  // See https://github.com/mysqljs/mysql/issues/2002
  return execute(
    "CREATE USER IF NOT EXISTS ?@'localhost' IDENTIFIED BY ?",
    [user, password]
  );
}

/**
 * Grant all privileges on given `dbName` database to the `owner` user.
 * @async
 * @param {string} dbName The name of the database to grant privileges on.
 * @param {string} owner The username receiving privileges,
 */
function grantOwnerPrivileges (dbName, owner) {
  return execute("GRANT ALL PRIVILEGES ON ??.* TO ??@'localhost'", [dbName, owner]);
}

/**
 * Drops a database named `dbName`, if it exists.
 *
 * @async
 * @param {string} dbName Name of the database to create.
 */
function dropDatabase (dbName) {
  return execute('DROP DATABASE IF EXISTS ??', [dbName]);
}

/**
 * Drops a `localhost user named `user`.
 *
 * @async
 * @param {string} user The username to drop.
 */
function dropUser (user) {
  return execute("DROP USER ?@'localhost'", [user]);
}

/**
 * Prompts the user to enter username and a hidden password unless it
 * they were already supplied by command line arguments (`-p` and/or `-u`).
 *
 * @param {Object} argv Script arguments.
 * @returns {Promise.<{ user: string, password: string}>} The username and password input.
 */
async function promptCredentialsIfNeeded (argv) {
  prompt.override = argv;

  prompt.start({ message: chalk`{cyan.bold knex.js}` });
  const getPrompt = util.promisify(prompt.get.bind(prompt));

  return getPrompt([
    {
      name: 'user',
      required: true,
      type: 'string',
      description: 'enter username',
      message: 'username is required'
    },
    {
      name: 'password',
      required: false,
      hidden: true,
      type: 'string',
      // eslint-disable-next-line ramda/prefer-ramda-boolean
      conform: () => true,
      message: 'password is required',
      description: chalk`enter {bold ${argv.user || 'user'}} password`
    }
  ]);
}

/**
 * Displays a yes/no confirm dialog to the user and expects input.
 *
 * @param {string} message Prompt message
 * @returns {Promise.<boolean>} Resolves to either `true` or `false`, depending on
 *  user input.
 */
async function promptConfirm (message) {
  prompt.start({ message: chalk`{cyan.bold knex.js}` });
  const getPrompt = util.promisify(prompt.get.bind(prompt));

  const res = await getPrompt([
    {
      name: 'yesno',
      message,
      validator: /y[es]*|n[o]?/,
      warning: 'must respond [y]es or [n]o'
    }
  ]);

  return boolify(res.yesno, { default: false });
}

async function show (message, fn) {
  log(`${message}...`);
  try {
    await fn();
    log(`${message}... ${symbols.success} done`);
  } catch (err) {
    log(`${message}... ${symbols.error} failed`);
    throw err;
  } finally {
    log.done();
  }
}

async function create (yargs) {
  const argv = yargs.argv;
  // Extract database config from `knexfile.js`
  const config = knexfile[argv.env];

  try {
    // Request username and password if they weren't supplied from `--password`/`-p` and `--user`/`-u`
    const { password, user } = await promptCredentialsIfNeeded(argv);

    const startTime = Date.now();
    await acquireConnection({ ...config.connection, user, password, database: undefined });
    console.info(
      chalk`{green.bold info} connected to {underline mysql://${config.connection.host}:${config.connection.port}}`
    );

    try {
      await show(
        chalk`{green.bold info} creating database {bold ${config.connection.database}}`,
        () => createDatabase(config.connection.database)
      );

      await show(chalk`{green.bold info} creating user {bold ${config.connection.user}}`, () =>
        createDatabaseOwnerIfNotExist(config.connection.user, config.connection.password)
      );

      await show(
        chalk`{green.bold info} granting all privileges on {bold ${config.connection.database}} to {bold ${config.connection.user}}`,
        () => grantOwnerPrivileges(config.connection.database, config.connection.user)
      );
      console.info(`all done ${ms(Date.now() - startTime)}`);
    } finally {
      await closeConnection();
    }
  } catch (err) {
    if (/cancell?ed/i.test(err.message)) {
      console.warn(chalk`${EOL}{yellow.bold warn} cancelled by user action`);
    } else {
      console.error(chalk`{red.bold err} an unexpected error occurred: {bold ${err.message}}`);
    }
    process.exit(1);
  }
}

async function destroy (yargs) {
  const argv = yargs.argv;
  // Extract database config from `knexfile.js`
  const config = knexfile[argv.env];

  try {
    const connectionUri = `mysql://${config.connection.host}:${config.connection.port}`;
    console.warn(
      chalk`{yellow.bold warn} this will drop {bold ${config.connection.database}} database and {bold ${config.connection.user}} user on {bold ${connectionUri}}`
    );

    const shouldContinue = await promptConfirm('continue? [y/N]');

    if (shouldContinue) {
      // Request username and password if they weren't supplied from `--password`/`-p` and `--user`/`-u`
      const { password, user } = await promptCredentialsIfNeeded(argv);

      const startTime = Date.now();
      await acquireConnection({ ...config.connection, user, password });
      console.info(
        chalk`{green.bold info} connected to {bold mysql://${config.connection.host}:${config.connection.port}}`
      );

      try {
        if (config.connection.user !== 'root') {
          await show(chalk`{green.bold info} dropping user {bold ${config.connection.user}}`, () =>
            dropUser(config.connection.user)
          );
        } else {
          console.info(
            chalk`{green.bold info} using user: {bold ${config.connection.user}} no action required`
          );
        }

        await show(
          chalk`{green.bold info} dropping database {bold ${config.connection.database}}`,
          () => dropDatabase(config.connection.database)
        );

        console.info(`all done ${ms(Date.now() - startTime)}`);
      } finally {
        await closeConnection();
      }
    } else {
      console.warn('aborted');
    }
  } catch (err) {
    if (/cancell?ed/i.test(err.message)) {
      console.warn(chalk`${EOL}{yellow.bold warn} cancelled by user action`);
    } else {
      console.error(chalk`{red.bold err} an unexpected error occurred: {bold ${err.message}}`);
    }
  }
}

// eslint-disable-next-line no-unused-expressions
yargs
  .option('e', {
    string: true,
    alias: 'env',
    choices: ['mysql'],
    default: 'mysql',
    describe: 'Knex environment (see knexfile.js)'
  })
  .option('u', {
    string: true,
    alias: 'user',
    default: 'root',
    describe: 'Privileged user to create database with'
  })
  .option('p', {
    string: true,
    alias: 'password',
    default: process.env.KNEX_MYSQL_PASSWORD,
    describe: 'Privileged user password (can also be set via KNEX_MYSQL_PASSWORD env var)'
  })
  .command('create', 'creates database and user', create)
  .command('destroy', 'drops database and user', destroy)
  .demandCommand()
  .version(pck.version).argv;
