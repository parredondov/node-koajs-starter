'use strict';
const {
  T,
  compose,
  cond,
  identical,
  identity,
  map,
  mapObjIndexed,
  trim,
  type,
  when
} = require('ramda');
const isString = require('./is-string');

/**
 * @function
 */
const isObject = compose(identical('Object'), type);

/**
 * Recursively trims string properties on `obj`.
 *
 * @param {Object} obj The object to trim.
 * @returns {Object} A new object with all of its string properties, trimmed.
 */
function trimObj (obj) {
  return mapObjIndexed(
    cond([
      [isString, trim],
      [Array.isArray, map(when(isString, trim))],
      [isObject, trimObj],
      [T, identity]
    ]),
    obj
  );
}

module.exports = trimObj;
