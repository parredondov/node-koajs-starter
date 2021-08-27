'use strict';
const { F, ifElse, lensProp, over, propSatisfies, replace, test } = require('ramda');
const path = require('path');
const nconf = require('nconf');
const toYAML = require('nconf-yaml');
const deepFreeze = require('deep-freeze-strict');

/**
 * The default environment if none is set through NODE_ENV.
 * @type {String}
 */
const DEFAULT_ENVIRONMENT = 'development';

/**
 * @type {String}
 */
const DEFAULTS_FILE_PATH = path.join(__dirname, 'defaults.yml');

/**
 * @type {RegExp}
 */
const ENV_VAR_PREFIX_REGEXP = /^LGEC_/i;

// Return a frozen, simple JS object,
// instead of exposing the entire `nconf` instance
module.exports = deepFreeze(
  nconf
    .argv({
      parseValues: true
    })
    .env({
      parseValues: true,
      separator: '_',
      lowerCase: true,
      transform: ifElse(
        // If the environment variable starts with `LGEC_`...
        propSatisfies(test(ENV_VAR_PREFIX_REGEXP), 'key'),
        // ...then strip `LGEC_` prefix from its name, so they get merged
        // with those defined in `defaults.yml` and via command line arguments
        over(lensProp('key'), replace(ENV_VAR_PREFIX_REGEXP, '')),
        // ...and discard all environment variables not starting with `LGEC_`
        F
      )
    })
    .file({
      file: DEFAULTS_FILE_PATH,
      format: toYAML
    })
    .defaults({
      env: process.env.NODE_ENV || DEFAULT_ENVIRONMENT
    })
    .get()
);
