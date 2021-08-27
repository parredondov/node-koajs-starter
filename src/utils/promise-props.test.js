'use strict';
const promiseProps = require('./promise-props');

test('should resolve values of all properties in the given object', async () => {
  const res = await promiseProps({
    foo: Promise.resolve(42),
    bar: Promise.resolve(true),
    baz: Promise.resolve('meh')
  });

  expect(res).toEqual({ foo: 42, bar: true, baz: 'meh' });
});

test('should reject the resulting `Promise` if at least one of the given object properties points to a rejected `Promise`', async () => {
  expect.assertions(2);

  try {
    await promiseProps({
      foo: Promise.resolve(42),
      bar: Promise.resolve(true),
      baz: Promise.reject(new Error('boom'))
    });
  } catch (err) {
    expect(err).toBeDefined();
    expect(err.message).toBe('boom');
  }
});

test('should resolve to an empty object when the given input is `null`', async () => {
  const res = await promiseProps(null);
  expect(res).toEqual({});
});

test('should resolve to an empty object when the given input is `undefined`', async () => {
  const res = await promiseProps(undefined);
  expect(res).toEqual({});
});

test('should resolve to an empty object when the given input is also an empty object', async () => {
  const res = await promiseProps({});
  expect(res).toEqual({});
});
