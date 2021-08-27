'use strict';
/**
 * Eloquent Cloud user panel API
 * @module user-portal-api
 */
const config = require('./src/config');
const startServer = require('./src/http/server');

// Start Koa server
// Configuration default values can be found in `config/defaults.yml` file.
// Environments can override these values by setting either command line
// arguments or environment variables (environment variables must be
// namespaced with `LGEC_` to avoid clashing with other variables that might also be present)
//
// Example:
// ```
// # Using command line arguments
// node app.js --http.port=9000
//
// # Using environment variables
// LGEC_HTTP_PORT=9000 node app.js
// ````
startServer(config);
