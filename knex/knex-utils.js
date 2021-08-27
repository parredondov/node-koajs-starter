'use strict';
const { all, equals } = require('ramda');

/**
 * Checks whether all given tables exist.
 * @param {import('knex')} knex A `knex` instance.
 * @param {Array.<String>} tableNames A list of tables to check.
 * @return {Promise.<Boolean>} Whether all tables in `tableNames` exist or not.
 */
async function tablesExist (knex, tableNames = []) {
  const res = await Promise.all(tableNames.map(table => knex.schema.hasTable(table)));
  return all(equals(true), res);
}

/**
 * Removes all rows from `tableName` and inserts `data` into it.
 * @param {import('knex')} knex A `knex` instance.
 * @param {String} tableName Name of the table to seed.
 * @param {Array.<Object>} data List of rows to insert.
 */
async function seedTable (knex, tableName, data) {
  // Delete ALL existing entries
  await knex(tableName).truncate();

  // Insert seed entries
  await knex(tableName).insert(data);
}

/**
 * Removes a FK constraint.
 * @param {import('knex')} knex A `knex` instance.
 * @param {String} tableName Name of the table to alter.
 * @param {String} column Name of the referenced FK column.
 */
async function dropForeignKey (knex, tableName, column) {
  return knex.schema.table(tableName, table => table.dropForeign([column]));
}

/**
 * Creates a new FK constraint between `tableName` and `inTable`.
 * @param {import('knex')} knex A `knex` instance.
 * @param {String} tableName Name of the table to alter.
 * @param {Object} fk A foreign key descriptor.
 * @param {String} fk.column Local column name being referenced.
 * @param {String} fk.references  Name of the referenced table.
 * @param {String} fk.inTable Name of the table referenced by the FK constraint.
 */
async function createForeignKey (knex, tableName, { column, inTable, references }) {
  await knex.schema.table(tableName, table => {
    return table.foreign(column).references(references).inTable(inTable);
  });
}

module.exports = {
  createForeignKey,
  dropForeignKey,
  seedTable,
  tablesExist
};
