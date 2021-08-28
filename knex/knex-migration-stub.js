// @ts-check
'use strict';

const TABLE_NAME = '';
/**
 * Runs and applies a migration script.
 * @param {import('knex')} knex A `knex` instance.
 */
async function up (knex) {
  // TODO: Define migration script
  return knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments();
    // TODO: Add necesary fields
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * Undo the current migration script.
 * @param {import('knex')} knex A `knex` instance.
 */
async function down (knex) {
  // TODO: Define rollback script
  return knex.schema.dropTable(TABLE_NAME);
}

module.exports = { up, down };
