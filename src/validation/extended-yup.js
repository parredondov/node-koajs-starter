/* eslint-disable no-template-curly-in-string */
'use strict';
const {
  F,
  applyTo,
  compose,
  either,
  empty,
  equals,
  filter,
  find,
  head,
  ifElse,
  isNil,
  length,
  lte,
  match,
  path,
  prop,
  split,
  unless
} = require('ramda');
const yup = require('yup');
const { isNilOrEmpty } = require('../utils/nil-empty');
const { rejectNilOrEmpty } = require('../utils/reject-nil');
const isString = require('../utils/is-string');
const lowerTrim = require('../utils/lower-trim');
const zxcvbn = require('zxcvbn');

/**
 * Default password complexity based on Windows security policies. The complexity
 * is defined as the minimum number of matching criteria a password must meet
 * to be accepted. Criteria include having uppercase and lowercase letters of European languages,
 * base 10 digits and special characters and any Unicode character that is categorized as an alphabetic character
 * but is not uppercase or lowercase
 *
 * @see https://docs.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/password-must-meet-complexity-requirements
 * @type {Number}
 */
const DEFAULT_MIN_PASSWORD_COMPLEXITY = 3;

/**
 * @function
 */
// @ts-ignore
const trueCount = compose(length, filter(equals(true)));

/**
 * @function
 */
const firstString = find(isString);

/**
 * A `yup.string()` extension method validating IPv4 addresses.
 *
 * @param {String=} message Message returned when validation does not pass.
 */
function ipv4 (message = 'invalid IP address') {
  return (
    this.max(15, message)
      // Safe~ish RegExp: input already limited to 39 characters of length
      // eslint-disable-next-line security/detect-unsafe-regex
      .matches(/(^(\d{1,3}\.){3}(\d{1,3})$)/, {
        message,
        excludeEmptyString: true
      })
      .test('ip', message, value => {
        return isNilOrEmpty(value)
          ? true
          : value.split('.').find(i => parseInt(i, 10) > 255) === undefined;
      })
  );
}

/**
 * A `yup.string()` extension method validating IPv6 addresses.
 *
 * @param {String=} message Message returned when validation does not pass.
 */
function ipv6 (message = 'invalid IPv6 address') {
  return (
    this.max(39, message)
      // Safe~ish RegExp: input already limited to 39 characters of length
      // eslint-disable-next-line security/detect-unsafe-regex
      .matches(/^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i, {
        message,
        excludeEmptyString: true
      })
  );
}

/**
 * A `yup.string()` extension method validating domain names.
 * @param {string} [message] Message returned when validation does not pass.
 */
function domain (message = 'Invalid domain name') {
  return (
    this.max(255, message)
      // See https://emailregex.com/ and https://tools.ietf.org/html/rfc5322#section-3.4.1
      // Safe~ish RegExp: input already limited to 256 characters of length
      // eslint-disable-next-line security/detect-unsafe-regex
      .matches(/^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/i, {
        message,
        excludeEmptyString: true
      })
  );
}

/**
 *  A `yup.string()` extension method validating email addresses local parts.
 * @param {string} [message] Message returned when validation does not pass.
 */
function localPart (message = 'Invalid address local part') {
  return (
    this.max(64, message)
      // See https://emailregex.com/ and https://tools.ietf.org/html/rfc5322#section-3.4.1
      // Safe~ish RegExp: input already limited to 64 characters of length
      // eslint-disable-next-line security/detect-unsafe-regex
      .matches(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+$/, {
        message,
        excludeEmptyString: true
      })
  );
}

/**
 *
 */
function allowEmpty () {
  return this.transform(value => (value === empty(value) ? undefined : value));
}

/**
 * @function
 */
const passwordFeedback = compose(
  lowerTrim,
  // @ts-ignore
  unless(isNil, compose(head, rejectNilOrEmpty, split(/\s*\.\s*/))),
  either(prop('warning'), path(['suggestions', 0]))
);

/**
 * A `yup.string()` extension that checks password strength and fails
 * validation is they do not meet a certain score.
 *
 * @param {Number|String} minScore Number between 0 and 4 (inclusive).
 *  The minimum score a password must get to pass validation
 * @param {String=} message Message returned when validation does not pass.
 */
function password (minScore, message = 'too weak') {
  return this.test('password-strength', message, function checkPasswordStrength (value) {
    if (isNilOrEmpty(value)) {
      // Pass validation on empty, `null` or `undefined` password
      // If password is actually required, `.required()` should be used as well
      return true;
    }

    const { feedback, score } = zxcvbn(value);
    // @ts-ignore
    const message = passwordFeedback(feedback);
    return score < Number(minScore)
      ? isNil(message)
        ? this.createError({ message: `too weak: ${message}` })
        : false
      : true;
  });
}

const meetsCriteria = criteria => (count, message, password) => {
  const complies = applyTo(
    password,
    // @ts-ignore
    ifElse(isNilOrEmpty, F, compose(lte(count), length, match(criteria)))
  );
  return complies ? true : message;
};

// Matches any uppercase latin character
const meetsUppercaseCriteria = meetsCriteria(/[A-Z]/g);

// Matches any lowercase latin character
const meetsLowercaseCriteria = meetsCriteria(/[a-z]/g);

// Matches any single roman digits
const meetsDigitsCriteria = meetsCriteria(/[0-9]/g);

// Matches any of the non-alphabetical, non-numerical symbols given below
const meetsSymbolsCriteria = meetsCriteria(/[-~!@#$%^&*_+=`|\\(){}[\]:;"'<>,.?/]/g);

// Matches any Unicode character, except uppercase and lowercase latin characters (like Asian characters)
const meetsUnicodeCriteria = meetsCriteria(/(?![a-zA-Z])\p{L}+/u);

/**
 * A `yup.string()` extension that checks a string "complexity" and fails
 * validation is they do not meet a certain threshold score. The complexity
 * is defined as the count of matching criteria a string meets.
 * Criteria include having at least one uppercase letter, one lowercase letter,
 * one base 10 digit, one special symbol and/or one Unicode non-Latin character.
 * This is useful for testing passwords, but can be applied to any string value.
 *
 * @param {Number|String} minComplexity Number between 0 and 4 (inclusive).
 *  The minimum score a password must get to pass validation
 * @param {String=} message Message returned when validation does not pass.
 */
function complexity (minComplexity, message) {
  return this.test('complexity', message, function checkComplexity (value) {
    if (isNilOrEmpty(value)) {
      // Pass validation on empty, `null` or `undefined` value
      // If string is actually required, `.required()` should be used instead
      return true;
    }

    const complexityChecks = [
      meetsUppercaseCriteria(1, 'include one uppercase letter', value),
      meetsLowercaseCriteria(1, 'include one lowercase letter', value),
      meetsDigitsCriteria(1, 'include one digit', value),
      meetsSymbolsCriteria(1, 'include one special character or symbol', value),
      meetsUnicodeCriteria(1, 'include one non-Latin character', value)
    ];
    // @ts-ignore
    const complexity = trueCount(complexityChecks);

    return complexity < Number(minComplexity || DEFAULT_MIN_PASSWORD_COMPLEXITY)
      ? isNil(message)
        ? this.createError({ message: firstString(complexityChecks) })
        : false
      : true;
  });
}

yup.addMethod(yup.string, 'ipv4', ipv4);
yup.addMethod(yup.string, 'ipv6', ipv6);
yup.addMethod(yup.string, 'domain', domain);
yup.addMethod(yup.string, 'localPart', localPart);
yup.addMethod(yup.string, 'password', password);
yup.addMethod(yup.string, 'complexity', complexity);
yup.addMethod(yup.string, 'allowEmpty', allowEmpty);

module.exports = yup;
