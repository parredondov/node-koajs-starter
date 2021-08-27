'use strict';

const { applyTo, compose, has, head, mapAccum } = require('ramda');
const { compactArray } = require('../utils/compact');
const differenceIgnoreCase = require('../utils/difference-ignore-case');
const { isNilOrEmpty } = require('../utils/nil-empty');

// dictionary of available flags and values
// Information found here: https://support.microsoft.com/en-us/topic/0b5d8e78-1e7d-41e7-7010-1de1d04b4e9b
var flags = [
  [0x0001, 'IS_ADMIN'],
  [0x0002, 'ACCOUNTDISABLE'],
  [0x0008, 'HOMEDIR_REQUIRED'],
  [0x0010, 'LOCKOUT'],
  [0x0020, 'PASSWD_NOTREQD'],
  [0x0040, 'PASSWD_CANT_CHANGE'],
  [0x0080, 'ENCRYPTED_TEXT_PWD_ALLOWED'],
  [0x0100, 'TEMP_DUPLICATE_ACCOUNT'],
  [0x0200, 'NORMAL_ACCOUNT'],
  [0x0400, 'PASSWORD_EXPIRED'],
  [0x0800, 'INTERDOMAIN_TRUST_ACCOUNT'],
  [0x1000, 'WORKSTATION_TRUST_ACCOUNT'],
  [0x2000, 'SERVER_TRUST_ACCOUNT'],
  [0x4000, 'DONT_EXPIRE_PASSWORD']
];

/**
 * Builds a list of LDAP modifications that should be applied to groups required to
 * make the given user a member of all `targetGroups` (and no other groups).
 *
 * @param {Object} user An LDAP user entry.
 * @param {string} user.dn The user's distinguished name.
 * @param {string[]} [user.memberOf] Distinguished named of groups a user
 *  is currently a member of.
 * @param {Object} targetGroups
 * @returns {Object[]} An array of LDAP modifications to groups defining
 *  `dn` and a `modification` properties.
 */
const decodeUAC = (uac, flag) => {
  uac = parseInt(uac);
  flag = flag || false;
  var response = [];
  // push flag name if value is present on UAC
  for (const value of flags) {
    if ((uac | value[0]) === uac) {
      response.push(flag ? String(value[0]) : value[1]);
    }
  }

  return response;
};

/**
 * Builds a list of LDAP modifications that should be applied to groups required to
 * make the given user a member of all `targetGroups` (and no other groups).
 *
 * @param {Object} user An LDAP user entry.
 * @param {string} user.dn The user's distinguished name.
 * @param {string[]} [user.memberOf] Distinguished named of groups a user
 *  is currently a member of.
 * @param {Object} targetGroups
 * @returns {Object[]} An array of LDAP modifications to groups defining
 *  `dn` and a `modification` properties.
 */
function addFlag (uac, value) {
  return uac | value;
}

/**
 * Builds a list of LDAP modifications that should be applied to groups required to
 * make the given user a member of all `targetGroups` (and no other groups).
 *
 * @param {Object} user An LDAP user entry.
 * @param {string} user.dn The user's distinguished name.
 * @param {string[]} [user.memberOf] Distinguished named of groups a user
 *  is currently a member of.
 * @param {Object} targetGroups
 * @returns {Object[]} An array of LDAP modifications to groups defining
 *  `dn` and a `modification` properties.
 */
function removeFlag (uac, value) {
  const testUac = uac | value;
  // flag is added and should be removed
  if (testUac === uac) return uac ^ value;
  // flag is not present in uac value and no action is done
  else return uac;
}

function getUserAccountControlModifications (base, available, selected) {
  if (isNilOrEmpty(selected)) return 512;
  return isNilOrEmpty(available)
    ? []
    : applyTo(
      compactArray(available),
      compose(
        ([flagsToAdd, flagsToDelete]) => {
          const uflags = head(mapAccum((a, b) => [addFlag(a, b)], base, flagsToAdd));
          const rflags = head(mapAccum((a, b) => [removeFlag(a, b)], uflags, flagsToDelete));
          if (hasFlag(rflags, 'PASSWORD_EXPIRED') && hasFlag(rflags, 'DONT_EXPIRE_PASSWORD')) {
            throw new Error(
              "Can't set `Force user to change password at next login` if `Password never expires` flags is set. Please turn off one of these options to continue."
            );
          }
          return rflags;
        },
        available => {
          return [selected, differenceIgnoreCase(available, selected)];
        }
      )
    );
}

const hasUac = has('userAccountControl');

const hasFlag = (uac, search) => {
  uac = parseInt(uac);
  const flag =
    typeof search === 'string'
      ? flags.find(el => el[1] === search)
      : flags.find(el => el[0] === search);
  return (uac | flag[0]) === uac;
};

const getFlag = search => {
  const flag =
    typeof search === 'string'
      ? flags.find(el => el[1] === search)
      : flags.find(el => el[0] === search);
  return flag[0];
};

module.exports = {
  decodeUAC,
  addFlag,
  removeFlag,
  getUserAccountControlModifications,
  hasUac,
  hasFlag,
  getFlag
};
