'use strict';
const { assoc, curry, keys, reduce } = require('ramda');

/**
 * Creates a new object with the own properties of the provided object, but the
 * keys renamed according to the keysMap object as `{oldKey: newKey}`.
 * When some key is not found in the keysMap, then it's passed as-is.
 *
 * @example
 *  renameKeys({ foo: 'life' }, { foo: 42 }); // -> { life: 42 }
 *
 * @function
 * @see https://github.com/ramda/ramda/wiki/Cookbook#rename-keys-of-an-object
 * @param {Object} keysMap Mapping of current key names to new names.
 * @param {Object} obj Object whose keys are to be renamed
 * @returns {Object} A new object based on `obj` with renamed keys.
 */
const renameKeys = curry((keysMap, obj) =>
  // eslint-disable-next-line security/detect-object-injection
  reduce((acc, key) => assoc(keysMap[key] || key, obj[key], acc), {}, keys(obj))
);

module.exports = renameKeys;
