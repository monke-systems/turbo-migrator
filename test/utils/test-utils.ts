import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob';
import * as mysql from 'mysql2/promise';
import type { MigrationData } from '../../src/migrate/dto/migrate.dto';
import type { MysqlCreds } from '@app/migrator';

const {
  MYSQL_HOST,
  MYSQL_PORT = '3306',
  MYSQL_USER,
  MYSQL_PASSWORD,
} = process.env;

export enum MIGRATIONS_DIR {
  TYPE_ORM = 'typeorm-migrations',
  PLAIN = 'plain-migrations',
}

export const getMigrationsFromDir = async (
  dir: MIGRATIONS_DIR,
): Promise<MigrationData[]> => {
  const fullPath = path.resolve('test', 'files', dir);
  const files = glob.sync(`${fullPath}/*{.sql,.ts}`);

  return Promise.all(
    files.map(async (filePath) => {
      const content = await fs.readFile(filePath, 'utf-8');
      return {
        filename: path.basename(filePath),
        content,
      };
    }),
  );
};

const getRandomString = (length: number) =>
  crypto.randomBytes(Math.floor(length / 2)).toString('hex');

export const generateDatabaseName = () => {
  return `turbo_migrator_test_${getRandomString(10)}`;
};

export const getMysqlCreds = (): Omit<MysqlCreds, 'database'> => {
  return {
    user: MYSQL_USER!,
    port: +MYSQL_PORT ?? 3306,
    host: MYSQL_HOST!,
    password: MYSQL_PASSWORD!,
  };
};

export const getMysqlConnection = () => {
  return mysql.createConnection(getMysqlCreds());
};

export const deleteMysqlTestDatabase = async (
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
