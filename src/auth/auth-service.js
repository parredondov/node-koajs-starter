'use strict';
const crypto = require('crypto');
const knex = require('../core/knex');
const config = require('../config');
const { isNilOrEmpty } = require('../utils/nil-empty');
const { dissoc } = require('ramda');

/**
 * Creates a password hash given a `password` payload.
 * @param {String} password The password payload.
 * @param {String} salt optional parameter to override default option.
 * @returns {String} A password hash string
 */
function hashPassword (password, salt = config.auth.salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

/**
 * validates a password hash given a `password` and a `hash` payload.
 * @param {String} password The password payload.
 * @param {String} hash The hash payload.
 * @param {String} salt optional parameter to override default option.
 * @returns {boolean} binary value that determines if it's valid
 */
function validatePassword (password, hash, salt = config.auth.salt) {
  var hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === hashedPassword;
}

async function login (user) {
  const res = await knex('users')
    .where('username', user.username)
    .timeout(15000, { cancel: true });
  if (isNilOrEmpty(res)) { return { authorized: false }; }
  return {
    ...dissoc('password', res[0]),
    authorized: validatePassword(user.password, res[0].password)
  };
}

module.exports = { hashPassword, validatePassword, login };
