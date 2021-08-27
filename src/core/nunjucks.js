'use strict';
const nunjucks = require('nunjucks');
const initials = require('initials');
const { compose, join, prop, split, tail } = require('ramda');
const { URL } = require('url');
const config = require('../config');
const { compactArray } = require('../utils/compact');

/**
 * Resolves the domain name from an LDAP URI.
 *
 * @example
 *  extractDomain('ldaps://ecdc0.dev.LGEC.io'); // 'dev.LGEC.io'
 *
 * @function
 * @param {string} uri An LDAP URI.
 * @returns {string} The LDAP domain name for the given URI.
 */
const extractDomain = compose(join('.'), tail, split('.'), prop('host'), url => new URL(url));

/**
 * `nunjucks` global context. Properties here will be available to all
 * templates in the application.
 * @type {Object}
 */
const ctx = Object.freeze({
  ldap: {
    // @ts-ignore
    domain: extractDomain(config.ldap.url)
  }
});

const env = new nunjucks.Environment();

// Expose `initials` and `compact` as a `nunjucks` filter
// See https://mozilla.github.io/nunjucks/api.html#custom-filters
env
  // @ts-ignore
  .addFilter('initials', initials)
  .addFilter('compact', compactArray)
  // Extend `nunjucks` global object with a `ctx` context
  // that will be available for all LDAP filters and templated
  .addGlobal('ctx', ctx);

module.exports = {
  render: env.render.bind(env),
  renderString: env.renderString.bind(env)
};
