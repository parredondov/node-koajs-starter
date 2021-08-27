'use strict';
const onceIfOk = require('./once-ok');

test('should return a function that calls the supplied function only the first time called', async () => {
  const fn = jest.fn();
  const memoizedFn = onceIfOk(fn);
  await memoizedFn();
  expect(fn).toHaveBeenCalledTimes(1);
  await memoizedFn();
  expect(fn).toHaveBeenCalledTimes(1);
});

test('should pass along arguments supplied', async () => {
  const fn = onceIfOk((a, b) => a + b);
  expect(await fn(40, 2)).toBe(42);
});

test('should not remember any value if function threw an exception', async () => {
  expect.assertions(1);
  const divide = onceIfOk((a, b) => {
    if (b === 0) {
      throw new Error('boom');
    } else {
      return a / b;
    }
  });

  try {
    await divide(42, 0);
  } catch (err) {
    await divide(2 * 42, 2);
    expect(await divide(256, 2)).toBe(42);
  }
});

test('should retain original arity', () => {
  const fn = onceIfOk((a, b) => a + b);
  // This should be re-written as `.toHaveLength(2)`, but a current bug
  // breaks testing function with that matcher
  // See https://github.com/facebook/jest/issues/9792
  expect(fn).toHaveProperty('length', 2);
});
