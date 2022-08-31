import * as crypto from 'crypto';

export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(length / 2).toString('hex');
};
