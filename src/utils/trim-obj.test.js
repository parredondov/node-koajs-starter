'use strict';
const trimObj = require('./trim-obj');

test('should trim a string property on the given object', () => {
  expect(trimObj({ foo: '  bar ' })).toEqual({ foo: 'bar' });
});

test('should trim all string properties on the given object', () => {
  expect(trimObj({ foo: '  bar ', baz: ' xuux  ' })).toEqual({ foo: 'bar', baz: 'xuux' });
});

test('should return already trimmed string values as-is', () => {
  expect(trimObj({ foo: 'bar', baz: ' xuux  ' })).toEqual({ foo: 'bar', baz: 'xuux' });
});

test('should leave all non string properties untouched', () => {
  const result = trimObj({ foo: 42, baz: true, bar: 33.3, fn: x => x });
  expect(result).toMatchObject({
    foo: 42,
    baz: true,
    bar: 33.3
  });
  expect(typeof result.fn).toBe('function');
});

test('should trim all string values in an array property', () => {
  expect(trimObj({ foo: ['bar  ', '   baz', 'meh'] })).toEqual({ foo: ['bar', 'baz', 'meh'] });
});

test('should recursively trim string properties on nested objects', () => {
  expect(trimObj({ foo: { bar: '  meh ', baz: ['  zuuz '] } })).toEqual({
    foo: { bar: 'meh', baz: ['zuuz'] }
  });
});
