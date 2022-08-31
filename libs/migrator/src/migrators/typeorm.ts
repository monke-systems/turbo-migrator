import * as mysql from 'mysql2/promise';
import type { ConnectionOptions } from 'typeorm';
import { Connection } from 'typeorm';
import type { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { TypeormMigrationErr } from '../errors';
import { Logger } from '../shared/logger';
import type { TypeOrmMigrateResult } from '../types';
import { isError } from '../utils/ts-type-guards';

export type MigrateTypeOrmOpts = {
  connectionOpts: ConnectionOptions;
  createDatabase: boolean;
};

export const migrateTypeOrm = async (
  opts: MigrateTypeOrmOpts,
): Promise<TypeOrmMigrateResult> => {
  const logger = new Logger();

  try {
    if (opts.createDatabase) {
      if (!['mysql', 'mariadb'].includes(opts.connectionOpts.type)) {
        throw new TypeormMigrationErr(
          'Currently create database feature with typeorm only available for mysql and mariadb',
        );
      }

      const { host, port, username, password } =
        opts.connectionOpts as MysqlConnectionOptions;
      const connection = await mysql.createConnection({
        user: username,
        host,
        port,
        password,
      });

      logger.info('Creating database', opts.connectionOpts.database);
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS ${opts.connectionOpts.database}`,
      );
      await connection.end();

      logger.info(`Database ${opts.connectionOpts.database} created`);
    }

    const conn = new Connection(opts.connectionOpts);

    logger.info('Connecting to datasource', opts.connectionOpts.type);
    await conn.connect();
    logger.info('Sucessfully connected to', opts.connectionOpts.type);

    logger.info('Run migrations');
    const res = await conn.runMigrations();
    logger.info('Done! Applied migrations:', res);

    await conn.close();

    return {
      appliedMigrations: res,
      log: logger.flushBuffer(),
    };
  } catch (e) {
    throw new TypeormMigrationErr(isError(e) ? e.message : 'Unknown err');
  }
};
