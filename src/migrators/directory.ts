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
  migrateToFilename?: string;
};

export type MigrateFromDirectoryResult = {
  appliedFiles: string[];
  log: string;
};

export type AppliedMigration = {
  filename: string;
  applied_at: Date;
};

const getLatestMysqlAppliedMigration = async (
  conn: mysql.Connection,
): Promise<AppliedMigration | undefined> => {
  await conn.query(`CREATE TABLE IF NOT EXISTS _migrations
  (
      filename  VARCHAR(150) PRIMARY KEY           NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
  ) CHARSET = utf8;
  `);

  const migrations = await conn.query(
    'SELECT * FROM _migrations ORDER BY filename DESC LIMIT 1',
  );

  // @ts-expect-error sorry its unsafe
  return migrations[0][0] as AppliedMigration;
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
    const connection = await mysql.createConnection({
      ...withoutUsername,
      multipleStatements: true,
    });

    const migrationFiles = glob.sync(opts.migrationsDirectory);
    logger.info('Found migration files', migrationFiles);

    logger.info('Querying latest applied migration');
    const latestApplied = await getLatestMysqlAppliedMigration(connection);

    await connection.beginTransaction();

    const startIndex =
      latestApplied === undefined
        ? 0
        : Number(
            migrationFiles.findIndex((val) => {
              return path.basename(val) === latestApplied.filename;
            }),
          ) + 1;

    const endIndex =
      opts.migrateToFilename === undefined
        ? undefined
        : migrationFiles.findIndex((val) => {
            return path.basename(val) === opts.migrateToFilename;
          });

    const toApply = migrationFiles.slice(startIndex, endIndex);

    logger.info('Migrations to apply list:', toApply);

    try {
      for (const migrationFile of toApply) {
        const filename = path.basename(migrationFile);

        const filePath = path.resolve(opts.migrationsDirectory, migrationFile);
        const content = await fs.readFile(filePath, 'utf-8');

        logger.info('Execute', filePath);
        await connection.query(content);
        await connection.query('INSERT INTO _migrations SET ?', [
          {
            filename,
          },
        ]);
      }

      await connection.commit();
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      await connection.end();
    }

    logger.info('Connection closed');

    return {
      appliedFiles: toApply,
      log: logger.flushBuffer().join(),
    };
  } else {
    throw new DirectoryMigrationErr(`Unsupported db type '${opts.dbType}'`);
  }
};
