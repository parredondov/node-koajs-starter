// @ts-check
'use strict';
// @ts-ignore
const data = require('table-name.json');

/**
 * Name of the table to seed
 * @type {String}
 */
const TABLE_NAME = 'table_name';

/**
 * Inserts rows into a particular table or tables.
 * @param {import('knex')} knex A `knex` instance.
 */
async function seed (knex) {
  const tableExists = await knex.schema.hasTable(TABLE_NAME);

  if (tableExists) {
    // Deletes ALL existing entries
    await knex(TABLE_NAME).del();

    // Inserts seed entries
    return knex(TABLE_NAME).insert(data);
  }
}

module.exports = { seed };
