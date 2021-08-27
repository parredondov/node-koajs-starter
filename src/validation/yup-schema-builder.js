'use strict';
const {
  T,
  always,
  applyTo,
  compose,
  cond,
  either,
  identical,
  is,
  isNil,
  match,
  pluck,
  prop,
  propSatisfies,
  reduce,
  tail,
  test,
  toPairs,
  trim,
  type,
  when
} = require('ramda');
const { rejectNil, rejectNilOrEmpty } = require('../utils/reject-nil');
const { isNotNilOrEmpty } = require('../utils/nil-empty');
const castArray = require('../utils/cast-array');
const lowerEquals = require('../utils/lower-equals');
const isOneOf = require('../utils/is-one-of');
const yup = require('./extended-yup');

/**
 * @function
 */
const isBoolean = either(compose(identical('Boolean'), type), is(Boolean));

/**
 * Tests if the given value matches any of the supported `yup` validators.
 * @function
 *
 * @param {String} value The value to check.
 * @returns {Boolean}
 */
const knownYupValidator = isOneOf([
  'allowEmpty',
  'complexity',
  'email',
  'integer',
  'ipv4',
  'ipv6',
  'length',
  'lessThan',
  'lowercase',
  'matches',
  'max',
  'min',
  'moreThan',
  'negative',
  'nullable',
  'oneOf',
  'password',
  'positive',
  'required',
  'uppercase',
  'url'
]);

/**
 * Creates a `RegExp` object from an input string. The input may contain
 * RegExp flags, like you'd normally use for defining JS regular expressions.
 *
 * @function
 * @param {String} expression A regular expression with optional flags (i.e.: `/foo.+/i`)
 * @returns {RegExp} A regular expression object.
 */
const createRegExp = compose(
  // eslint-disable-next-line security/detect-non-literal-regexp
  ([expression, flags]) => new RegExp(expression, flags),
  rejectNilOrEmpty,
  castArray,
  when(test(/^\/.+\/[a-z]*$/), compose(tail, match(/^\/(.+)\/([a-z]*)$/))),
  trim,
  String
);

/**
 * @function
 */
const validationInputFor = cond([
  // @ts-ignore
  [propSatisfies(lowerEquals('matches'), 'validator'), ({ value }) => createRegExp(value)],
  // If the value is a simple boolean, avoid passing it as an argument to
  // the validation function
  [propSatisfies(isBoolean, 'value'), always(undefined)],
  [T, prop('value')]
]);

function buildYupSchemaFor (field) {
  if (!yup[field.type]) {
    return;
  }

  return applyTo(
    toPairs(field.validations),
    compose(
      // Mark as `required()` if field configuration states so
      schema => (field.required ? schema.required() : schema),
      // Wrap schema in an `array().of()` function if it was declared as `multiple`
      schema => (field.multiple ? yup.array().of(schema) : schema),
      schema =>
        isNotNilOrEmpty(field.values) ? schema.oneOf(pluck('value', field.values)) : schema,
      reduce((schema, [validator, value]) => {
        // eslint-disable-next-line security/detect-object-injection
        if (!schema[validator] || !knownYupValidator(validator)) {
          // Don't extend schema if validator is not a known `yup` function
          return schema;
        }

        const input = validationInputFor({ type: field.type, validator, value });

        // eslint-disable-next-line security/detect-object-injection
        return isNil(input) ? schema[validator]() : schema[validator](input);
      }, yup[field.type]())
    )
  );
}

/**
 * Creates a `yup` validation schema from an array of field definitions.
 *
 * @function
 * @param {Array.<Object>} fields
 * @returns {Object} A `yup` schema
 */
const buildYupSchema = compose(
  shape => yup.object(shape).required(),
  rejectNil,
  reduce((schema, field) => {
    return { ...schema, [field.attribute]: buildYupSchemaFor(field) };
  }, {}),
  castArray
);

module.exports = buildYupSchema;
