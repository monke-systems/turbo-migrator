import * as fs from 'fs/promises';
import * as path from 'path';
import * as glob from 'glob';
import * as mysql from 'mysql2/promise';
import type { MysqlConfig } from '../config';
import { DIRECTORY_PROVIDER_DATABASE } from '../config';
import { DirectoryMigrationErr } from '../errors';
import { Logger } from '../shared/logger';

export type MigrateFromDirectoryOpts = {
  dbType: DIRECTORY_PROVIDER_DATABASE;
  mysql: MysqlConfig;
  migrationsDirectory: string;
  createDatabase: boolean;
};

export type MigrateFromDirectoryResult = {
  appliedFiles: string[];
  log: string;
};

export const migrateFromDirectory = async (
  opts: MigrateFromDirectoryOpts,
): Promise<MigrateFromDirectoryResult> => {
  const logger = new Logger({
    enableBuffer: false,
  });

  if (opts.dbType === DIRECTORY_PROVIDER_DATABASE.MYSQL) {
    if (opts.createDatabase) {
      const { database, username, ...withoutDatabase } = opts.mysql;
      const conn = await mysql.createConnection(withoutDatabase);

      logger.info('Creating database', opts.mysql.database);
      await conn.query(`CREATE DATABASE IF NOT EXISTS ${opts.mysql.database}`);
      await conn.end();
    }

    logger.info('Started mysql migration');
    logger.info('Connecting to', opts.mysql.host);

    const { username, ...withoutUsername } = opts.mysql;
    const connection = await mysql.createConnection(withoutUsername);

    const filesToMigrate = glob.sync(opts.migrationsDirectory);
    logger.info('Found files to migrate', filesToMigrate);

    await connection.beginTransaction();

    for (const migrationFile of filesToMigrate) {
      const filePath = path.resolve(opts.migrationsDirectory, migrationFile);
      const content = await fs.readFile(filePath, 'utf-8');

      logger.info('Execute', filePath);
      await connection.query(content);
    }

    await connection.commit();
    await connection.end();

    logger.info('Connection closed');

    return {
      appliedFiles: filesToMigrate,
      log: logger.flushBuffer().join('\n'),
    };
  } else {
    throw new DirectoryMigrationErr(`Unsupported db type '${opts.dbType}'`);
  }
};
