// @ts-check
'use strict';

const ACCOUNT_CONTROL_TABLE_NAME = 'user_account_control';
const ACCESS_CONTROL_TABLE_NAME = 'user_access_control';

/**
 * Runs and applies a migration script.
 * @param {import('knex')} knex A `knex` instance.
 */
async function up (knex) {
  await knex.schema.createTable(ACCOUNT_CONTROL_TABLE_NAME, function (table) {
    table.increments();
    table.integer('value').notNullable().unique();
    table.string('key').notNullable();
    table.string('name').notNullable();
    table.boolean('active').notNullable().defaultTo(true);
    table.boolean('admin_only').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
  return knex.schema.createTable(ACCESS_CONTROL_TABLE_NAME, function (table) {
    table.increments();
    table.integer('value').notNullable().unique();
    table.string('key').notNullable();
    table.string('name').notNullable();
    table.boolean('active').notNullable().defaultTo(true);
    table.boolean('admin_only').notNullable().defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * Undo the current migration script.
 * @param {import('knex')} knex A `knex` instance.
 */
async function down (knex) {
  await knex.schema.dropTable(ACCOUNT_CONTROL_TABLE_NAME);
  return knex.schema.dropTable(ACCESS_CONTROL_TABLE_NAME);
}

module.exports = { up, down };
