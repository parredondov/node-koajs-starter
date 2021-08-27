// @ts-check
'use strict';
// @ts-ignore
const data = require('./seed_users.json');
const { hashPassword } = require('../../src/auth/auth-service');

/**
 * Name of the table to seed
 * @type {String}
 */
const TABLE_NAME = 'users';

/**
 * Inserts rows into a particular table or tables.
 * @param {import('knex')} knex A `knex` instance.
 */
async function seed (knex) {
  const tableExists = await knex.schema.hasTable(TABLE_NAME);

  if (tableExists) {
    // Deletes ALL existing entries
    await knex(TABLE_NAME).truncate();

    // Inserts seed entries
    const d = data.map(v => {
      v.password = hashPassword(v.password);
      return v;
    });
    return knex(TABLE_NAME).insert(d);
  }
}

module.exports = { seed };
