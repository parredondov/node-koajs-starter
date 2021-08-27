'use strict';
const {
  always,
  applySpec,
  compose,
  dropLastWhile,
  dropWhile,
  equals,
  identity,
  map,
  memoizeWith,
  trim,
  unless
} = require('ramda');
const mm = require('micromatch');
const isOneOf = require('../utils/is-one-of');
const splitByComma = require('../utils/split-comma');
const truthyKeys = require('../utils/truthy-keys');
const { isNilOrEmpty } = require('../utils/nil-empty');

/**
 * @type {String}
 */
const DEFAULT_HTTP_METHOD = 'GET';

/**
 * @function
 */
const restrictionsAsGlobMatchers = map(
  // @ts-ignore
  compose(globs => route => mm.some(route, globs, { nocase: true }), splitByComma)
);

/**
 * @function
 */
const createRoleAccessGuard = restrictionsByRole => {
  return compose(truthyKeys, applySpec(restrictionsAsGlobMatchers(restrictionsByRole)));
};

/**
 * @function
 */
const castHttpMethod = unless(
  isOneOf(['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']),
  always(DEFAULT_HTTP_METHOD)
);

/**
 * @function
 */
const trimSlashes = compose(
  // Remove any leading slashes
  dropWhile(equals('/')),
  // Remove trailing slashes
  dropLastWhile(equals('/')),
  // @ts-ignore
  trim,
  String
);

/**
 * Given a map of role names to comma delimited resource identifiers, creates and returns a function
 * that determines whether or not a set of roles can access a resource. Resource identifiers support glob
 * matching and must be defined as an HTTP method followed by a pathname (e.g.: `GET/users*`).
 *
 * @see https://github.com/micromatch/micromatch
 * @param {Object} restrictionsByRole A map of comma separated resource identifiers to role names. Identifiers
 *  supports globs.
 * @returns {Function} A function that takes in a set of `roles` and a resource identifier (given
 *  by its `pathname` and, optionally, HTTP `method`) and returns `true` if any of those roles are
 *  allowed to access the resource.
 */
function whichRolesCanAccess (restrictionsByRole) {
  // Apply memoization to the function returning roles allowed for a given resource
  // so we don't recompute the glob matching each time
  // @ts-ignore
  const allowedRolesFor = memoizeWith(identity, createRoleAccessGuard(restrictionsByRole));

  /**
   * Checks if the resource described by `pathname`, `method` and `query` can
   * be accessed by a user with a `roles` set of permission roles.s
   *
   * @param {string[]} roles A list of user roles.
   * @param {string} pathname The full path of the resource being accessed.
   * @param {Object} [options]
   * @param {string} [options.method='GET'] HTTP method of the current resource being requested.
   * @returns {Object} An object with `allow`, `requires` and `resource` attributes.
   */
  return function canAccessResource (
    roles,
    pathname,
    // @ts-ignore
    { method = DEFAULT_HTTP_METHOD } = {}
  ) {
    const resource = `${castHttpMethod(method)}/${trimSlashes(pathname)}`;
    const requires = allowedRolesFor(resource);
    return { allow: isNilOrEmpty(requires) || isOneOf(roles, requires), requires, resource };
  };
}

module.exports = whichRolesCanAccess;
