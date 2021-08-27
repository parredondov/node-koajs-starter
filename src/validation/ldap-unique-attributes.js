'use strict';
const {
  compose,
  filter,
  mapObjIndexed,
  pick,
  pluck,
  propEq,
  reduce,
  replace,
  toPairs
} = require('ramda');
const { and, eq, not } = require('../ldap-user/ldap-filters');
const { isNotNilOrEmpty } = require('../utils/nil-empty');
const { rejectNilOrEmpty } = require('../utils/reject-nil');
const promiseProps = require('../utils/promise-props');
const truthyKeys = require('../utils/truthy-keys');
const flatSpreadObj = require('../utils/flat-spread-obj');

/**
 * @function
 */
// @ts-ignore
const extractAllUniqueAttrs = compose(pluck('attribute'), filter(propEq('unique', true)));

/**
 * Removes an index suffix of the form `.[0-9]+` or `\[[0-9]+\]` from the
 * given` value` string.
 *
 * @example
 *  stripIndex('otherMailbox.2'); // 'otherMailbox`
 *
 * @function
 * @param {string} value The value to remove the index from.
 * @returns {string} The given `value` with the index suffix removed.
 */
const stripIndex = replace(/(\.[0-9]+|\[[0-9]+\])*$/, '');

function checkAttributes (ldap, attrs, sAMAccountName) {
  const notsAMAccountNameFilter = sAMAccountName
    ? // eslint-disable-next-line ramda/no-redundant-not
    not(eq('sAMAccountName', sAMAccountName))
    : undefined;

  // Turn attributes object into a map of attribute names mapping to
  // LDAP queries testing for their existence
  const checks = mapObjIndexed((value, attribute) => {
    const eqFilter = eq(stripIndex(attribute), value);
    const filter = notsAMAccountNameFilter ? and([eqFilter, notsAMAccountNameFilter]) : eqFilter;
    return ldap.test(filter);
  }, attrs);

  return promiseProps(checks);
}

/**
 * @function
 */
const createUniquenessError = compose(
  errors => Object.assign(new Error('Some attributes failed validation'), { errors }),
  reduce((errors, [attr, value]) => {
    return { [attr]: `${value} already in use`, ...errors };
  }, {}),
  toPairs
);

/**
 * Checks if provided `attrs` LDAP attributes are unique within the LDAP
 * directory. Only those attributes whose field definition in `fields` are
 * marked as `unique` will be validated.
 *
 * @param {Object} ldap An LDAP client instance.
 * @param {Object[]} fields Field definitions.
 * @param {Object} attrs Attributes to check for uniqueness.
 * @param {Object} options Check settings.
 * @param {string[]|string} [options.exclude] `sAMAccountName` of entries
 *  that should be excluded or ignored when checking for attribute uniqueness.
 * @returns {Promise.<Object>}
 */
async function checkAttributesUniqueness (ldap, fields, attrs, { exclude } = {}) {
  const uniqueAttributes =
    // Ignore check if `fields` could not be found or were not set
    isNotNilOrEmpty(fields)
      ? pick(extractAllUniqueAttrs(fields), rejectNilOrEmpty(attrs))
      : undefined;

  if (isNotNilOrEmpty(uniqueAttributes)) {
    const flatUniqueAttrs = flatSpreadObj(uniqueAttributes);
    const checks = await checkAttributes(ldap, flatUniqueAttrs, exclude);

    // Take values from request body that were conflicting to report back errors
    const conflictingAttrs = pick(truthyKeys(checks), flatUniqueAttrs);

    if (isNotNilOrEmpty(conflictingAttrs)) {
      // Throw an error if any unique attribute is already in used
      throw createUniquenessError(conflictingAttrs);
    }
  }

  return uniqueAttributes;
}

module.exports = checkAttributesUniqueness;
