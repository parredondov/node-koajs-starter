'use strict';
const { curry, forEach } = require('ramda');
const log = require('../core/logger');

/**
 * System signals the app will listen to for initiating a shutdown.
 * @type {NodeJS.Signals[]}
 */
const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'];

/**
 * Time in milliseconds to wait before forcing shutdown.
 * @type {number}
 */
const SHUTDOWN_TIMEOUT = 15000;

/**
 * Logs a message and exits the process with a positive status code.
 * @param {number} timeout Timeout before force exiting
 * @return {Function} A function that logs and exits
 */
const exitAfter = timeout => () => {
  log.warn(`Could not close resources gracefully after ${timeout}ms: forcing shutdown`);
  return process.exit(1);
};

/**
 * Warns about receiving a shutdown signals and sets a forced shutdown mechanism.
 * @param timeout Time to wait before forcing shutdown (milliseconds)
 * @param signal Signal received on shutdown
 * @return {*}
 */
const beforeShutdown = curry(
  /** @type {(timeout: number, signal: NodeJS.Signals) => void} */
  (timeout, signal) => {
    log.warn(`Shutting down: received [${signal}] signal`);
    // Force shutdown after timeout
    // @ts-ignore
    setTimeout(exitAfter(timeout), timeout).unref();
  }
);

/**
 * Listen for TERM (e.g. kill) and INT (e.g. Ctrl+C) signals
 * and execute given function once.
 * @param signals System signals to listen to
 * @param fn Function to execute on shutdown
 * @return A curried function that takes in an array of `signals` and a
 *  function that takes them one at a time and performs some clean up operation.
 */
const processOnce = curry(
  /** @type {(signals: NodeJS.Signals[], fn: (sig: string) => any) => string[]} */
  (signals, fn) => forEach(sig => process.once(sig, () => fn(sig)), signals)
);

const onShutdown = processOnce(SHUTDOWN_SIGNALS);
onShutdown(beforeShutdown(SHUTDOWN_TIMEOUT));

module.exports = onShutdown;
