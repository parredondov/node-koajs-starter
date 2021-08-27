'use strict';
const config = require('../config');
const { hashPassword, validatePassword } = require('./auth-service');

test('should take the value from the config file (currently gtsFLYihvFqwa2K)', () => {
  expect(config.auth.salt).toBe('gtsFLYihvFqwa2K');
});

test('should be able to validate a hashed password', () => {
  const hash = hashPassword('password1');
  expect(validatePassword('password1', hash)).toBe(true);
});

test('should return false if password don`t match a hashed password', () => {
  const hash = hashPassword('password1');
  expect(validatePassword('password2', hash)).toBe(false);
});

test('should be able to validate a hashed password with a custom salt', () => {
  const hash = hashPassword('password1', 'abc1');
  expect(validatePassword('password1', hash, 'abc1')).toBe(true);
});

test('should return false if salt don`t match a hashed password', () => {
  const hash = hashPassword('password1', 'abc1');
  expect(validatePassword('password1', hash, 'abc2')).toBe(false);
});
