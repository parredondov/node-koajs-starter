'use strict';

const {
  addFlag,
  decodeUAC,
  removeFlag
} = require('./user-account-control-service');

describe('decode UAC', () => {
  test('should generate an array containing the correct userAccountControl flags', () => {
    expect(decodeUAC(512)).toEqual(['NORMAL_ACCOUNT']);
    expect(decodeUAC(514)).toEqual(['ACCOUNTDISABLE', 'NORMAL_ACCOUNT']);
    expect(decodeUAC(515)).toEqual(['IS_ADMIN', 'ACCOUNTDISABLE', 'NORMAL_ACCOUNT']);
    expect(decodeUAC(16896)).toEqual(['NORMAL_ACCOUNT', 'DONT_EXPIRE_PASSWORD']);
    expect(decodeUAC(16898)).toEqual(['ACCOUNTDISABLE', 'NORMAL_ACCOUNT', 'DONT_EXPIRE_PASSWORD']);
  });
});

describe('Add flag value to UAC', () => {
  test('should add the ACCOUNTDISABLE flag', () => {
    const uac = 512;
    const accountDisableFlag = [0x0002, 'ACCOUNTDISABLE'];
    const modifiedUAC = addFlag(uac, accountDisableFlag[0]);
    expect(modifiedUAC).toEqual(514);
    expect(decodeUAC(modifiedUAC)).toEqual(['ACCOUNTDISABLE', 'NORMAL_ACCOUNT']);
  });
  test("should NOT add the ACCOUNTDISABLE flag because it's already present", () => {
    const uac = 514;
    const accountDisableFlag = [0x0002, 'ACCOUNTDISABLE'];
    const modifiedUAC = addFlag(uac, accountDisableFlag[0]);
    expect(modifiedUAC).toEqual(514);
    expect(decodeUAC(modifiedUAC)).toEqual(['ACCOUNTDISABLE', 'NORMAL_ACCOUNT']);
  });
});

describe('Remove flag value to UAC', () => {
  test('should remove the ACCOUNTDISABLE flag', () => {
    const uac = 514;
    const accountDisableFlag = [0x0002, 'ACCOUNTDISABLE'];
    const modifiedUAC = removeFlag(uac, accountDisableFlag[0]);
    expect(modifiedUAC).toEqual(512);
    expect(decodeUAC(modifiedUAC)).toEqual(['NORMAL_ACCOUNT']);
  });
  test("should NOT remove the ACCOUNTDISABLE flag because it's already present", () => {
    const uac = 512;
    const accountDisableFlag = [0x0002, 'ACCOUNTDISABLE'];
    const modifiedUAC = removeFlag(uac, accountDisableFlag[0]);
    expect(modifiedUAC).toEqual(512);
    expect(decodeUAC(modifiedUAC)).toEqual(['NORMAL_ACCOUNT']);
  });
});
