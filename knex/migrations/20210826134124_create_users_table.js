// @ts-check
'use strict';

const TABLE_NAME = 'users';
/**
 * Runs and applies a migration script.
 * @param {import('knex')} knex A `knex` instance.
 */
async function up (knex) {
  return knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments();
    table.string('username').notNullable();
    table.string('password').notNullable();
    table.string('name').notNullable();
    table.string('lastname').notNullable();
    table.string('email').notNullable();
    table.integer('account_control').notNullable().defaultTo(512);
    table.integer('access_control').notNullable().defaultTo(1); // TODO: implement access control
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * Undo the current migration script.
 * @param {import('knex')} knex A `knex` instance.
 */
async function down (knex) {
  return knex.schema.dropTable(TABLE_NAME);
}

module.exports = { up, down };
