'use strict';
const zipSpread = require('./zip-spread');

test('it should return a list of pairs containing indexed keys and values from the give list', () => {
  expect(zipSpread('bar', [1, 2, 3])).toEqual([
    ['bar.0', 1],
    ['bar.1', 2],
    ['bar.2', 3]
  ]);
});

test('it should support nested arrays by flattening their contents and producing the expected sequential indexed keys', () => {
  expect(zipSpread('bar', [1, [2, 3, [42]], 4])).toEqual([
    ['bar.0', 1],
    ['bar.1.0', 2],
    ['bar.1.1', 3],
    ['bar.1.2.0', 42],
    ['bar.2', 4]
  ]);
});

test('should return an empty array if the given list is empty', () => {
  expect(zipSpread('bar', [])).toEqual([]);
});

test('should return an empty array if the given list is `null`', () => {
  expect(zipSpread('bar', [])).toEqual([]);
});

test('should return an empty array if the given list is `undefined`', () => {
  expect(zipSpread('bar', [])).toEqual([]);
});
