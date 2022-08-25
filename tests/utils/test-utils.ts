import * as crypto from 'crypto';
import * as path from 'path';
import type * as mysql from 'mysql2/promise';

export enum MIGRATIONS_DIR {
  TYPE_ORM = 'typeorm-migrations',
  DIRECTORY = 'directory-migrations',
}

export const getMigrationsDir = (dir: MIGRATIONS_DIR) => {
  let base = path.resolve('tests', 'files', dir);

  if (dir === MIGRATIONS_DIR.TYPE_ORM) {
    base += '/*{.ts,.js}';
  }
  if (dir === MIGRATIONS_DIR.DIRECTORY) {
    base += '/*.sql';
  }

  return base;
};

const getRandomString = (length: number) =>
  crypto.randomBytes(Math.floor(length / 2)).toString('hex');

export const generateDatabaseName = () => {
  return `turbo_migrator_test_${getRandomString(10)}`;
};

export const deleteTestDatabase = async (
  conn: mysql.Connection,
  dbName: string,
) => {
  await conn.query(`DROP DATABASE IF EXISTS ${dbName}`);
};

export const setEnvs = (...envs: [string, string][]) => {
  for (const [key, value] of envs) {
    process.env[key] = value;
  }
};
