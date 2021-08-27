'use strict';
const flatSpreadObj = require('./flat-spread-obj');

test('should generate a flat object by spreading all arrays on the input', () => {
  expect(flatSpreadObj({ foo: [1, 2, 3] })).toEqual({ 'foo.0': 1, 'foo.1': 2, 'foo.2': 3 });
});

test('should support spreading nested arrays', () => {
  expect(flatSpreadObj({ foo: [1, [2, 3], 4] })).toEqual({
    'foo.0': 1,
    'foo.1.0': 2,
    'foo.1.1': 3,
    'foo.2': 4
  });
});

test('should keep non-array values on the original object intact', () => {
  expect(flatSpreadObj({ foo: [1, 2, 3], bar: 42 })).toMatchObject({ bar: 42 });
});

test('should return the same object if no arrays were present in the input', () => {
  expect(flatSpreadObj({ foo: true, bar: 42 })).toEqual({ foo: true, bar: 42 });
});

test('should return an empty object if the input is an empty object', () => {
  expect(flatSpreadObj({})).toEqual({});
});

test('should return `null` if the input is `null`', () => {
  expect(flatSpreadObj(null)).toBeNull();
});

test('should return `undefined` if the input is `undefined`', () => {
  expect(flatSpreadObj(undefined)).toBeUndefined();
});
