'use strict';
const { dissoc } = require('ramda');
const jwt = require('jsonwebtoken');

/**
 * Creates a signed JWT token from the given `user` payload.
 * @param {Object} user The user payload as present in the Koa context state.
 * @param {Object} options `jsonwebtoken` options.
 * @returns {String} A signed JWT token.
 */
function generateJwt (user, secret, options = {}) {
  return jwt.sign(
    {
      env: options.environment,
      email: user.email,
      displayName: `${user.name} ${user.lastname}`
    },
    secret,
    {
      subject: user.username,
      ...dissoc('environment', options)
    }
  );
}

module.exports = generateJwt;
