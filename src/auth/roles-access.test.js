'use strict';
const whichRolesCanAccess = require('./roles-access');

test('should return `true` for `allow` if at least one resource glob matches for the given role', () => {
  const canAccess = whichRolesCanAccess({ admin: '*/users*' });
  expect(canAccess('admin', '/users', { method: 'GET' })).toHaveProperty('allow', true);
});

test('should return `true` for `allow` for all roles that have a matching resource identifier', () => {
  const canAccess = whichRolesCanAccess({ admin: '*/users*', reporter: 'GET/users*' });
  expect(canAccess('admin', '/users', { method: 'GET' })).toHaveProperty('allow', true);
  expect(canAccess('reporter', '/users', { method: 'GET' })).toHaveProperty('allow', true);
  expect(canAccess(['admin', 'repoter'], '/users', { method: 'GET' })).toHaveProperty(
    'allow',
    true
  );
});

test('should return `true` for `allow` if at least one resource glob matches for any role in the given roles set', () => {
  const canAccess = whichRolesCanAccess({ admin: '*/users*' });
  expect(canAccess(['admin', 'reporter'], '/users', { method: 'GET' })).toHaveProperty(
    'allow',
    true
  );
});

test('should return `true` for `allow` for all HTTP methods if the resource identifier starts with `*`', () => {
  const canAccess = whichRolesCanAccess({ admin: '*/users*' });
  expect(canAccess('admin', '/users', { method: 'GET' })).toHaveProperty('allow', true);
  expect(canAccess('admin', '/users', { method: 'POST' })).toHaveProperty('allow', true);
  expect(canAccess('admin', '/users', { method: 'DELETE' })).toHaveProperty('allow', true);
  expect(canAccess('admin', '/users', { method: 'PUT' })).toHaveProperty('allow', true);
  expect(canAccess('admin', '/users', { method: 'OPTIONS' })).toHaveProperty('allow', true);
});

test('should return a list of all role names that are allowed to access the given resource', () => {
  const canAccess = whichRolesCanAccess({
    admin: '*/users*',
    reporter: 'GET/users,GET/reports',
    developer: 'POST/menu,*/users*',
    manager: 'POST/users*'
  });

  const { requires } = canAccess('admin', '/users', { method: 'GET' });
  expect(requires).toEqual(['admin', 'reporter', 'developer']);
});

test('should return `false` for `allow` if no resource glob produced a match for the given role', () => {
  const canAccess = whichRolesCanAccess({ admin: '*/users*', reporter: 'POST/users*' });
  expect(canAccess('reporter', '/users', { method: 'GET' })).toHaveProperty('allow', false);
});

test('should return `true` for `allow` if the HTTP method does not match on any of the given resources for any role', () => {
  const canAccess = whichRolesCanAccess({ admin: 'GET/users*,DELETE/users*' });
  expect(canAccess('any', '/users', { method: 'POST' })).toHaveProperty('allow', true);
});

test('should default HTTP method to GET if not provided', () => {
  const canAccess = whichRolesCanAccess({ admin: 'GET/users*' });
  expect(canAccess('admin', '/users')).toHaveProperty('allow', true);
});

test('should default HTTP method to GET if an invalid method is given', () => {
  const canAccess = whichRolesCanAccess({ admin: 'GET/users*' });
  expect(canAccess('admin', '/users', { method: 'FOO' })).toHaveProperty('allow', true);
});
