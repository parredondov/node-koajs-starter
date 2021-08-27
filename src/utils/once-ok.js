'use strict';
const { curryN, nAry } = require('ramda');

/**
 * Accepts an async function `fn` and returns a function that guards invocation of
 * `fn` such that `fn` can only ever be called once after a successfully
 * invocation (i.e.: an error was not thrown), no matter how many times the returned
 * function is invoked. The first actual value, obtain from a non-throwing call to `fn`,
 * is returned in subsequent invocations.
 *
 * @function
 * @param {Function} fn The async function to wrap in a call-only-once wrapper.
 * @return {Function} The wrapped async function.
 */
const onceIfOk = curryN(1, function onceIfOk (fn) {
  let wasCalled = false;
  let result;
  return nAry(fn.length, async function callOnlyOnce (...args) {
    if (wasCalled) {
      return result;
    }
    result = await fn(...args);
    wasCalled = true;
    return result;
  });
});

module.exports = onceIfOk;
