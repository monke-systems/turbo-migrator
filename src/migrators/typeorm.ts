import * as mysql from 'mysql2/promise';
import { DataSource } from 'typeorm';
import type { DataSourceOptions, Migration } from 'typeorm';
import type { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { TypeormMigrationErr } from '../errors';
import { Logger } from '../shared/logger';
import { isError } from '../utils/ts-type-guards';

export type MigrateTypeOrmOpts = {
  datasource: DataSourceOptions;
  createDatabase: boolean;
};

export type TypeOrmMigrateResult = {
  appliedMigrations: Migration[];
  log: string;
};

export const migrateTypeOrm = async (
  opts: MigrateTypeOrmOpts,
): Promise<TypeOrmMigrateResult> => {
  const logger = new Logger({
    enableBuffer: false,
  });

  try {
    if (opts.createDatabase) {
      if (!['mysql', 'mariadb'].includes(opts.datasource.type)) {
        throw new TypeormMigrationErr(
          'Currently create database feature with typeorm only available for mysql and mariadb',
        );
      }

      const { host, port, username, password } =
        opts.datasource as MysqlConnectionOptions;
      const connection = await mysql.createConnection({
        user: username,
        host,
        port,
        password,
      });

      logger.info('Creating database', opts.datasource.database);
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS ${opts.datasource.database}`,
      );
      await connection.end();

      logger.info(`Database ${opts.datasource.database} created`);
    }

    const source = new DataSource(opts.datasource);

    logger.info('Connecting to datasource', opts.datasource.type);
    await source.initialize();
    logger.info('Sucessfully connected to', opts.datasource.type);

    logger.info('Run migrations');
    const res = await source.runMigrations();
    logger.info('Done! Applied migrations:', res);

    await source.destroy();

    return {
      appliedMigrations: res,
      log: logger.flushBuffer().join(),
    };
  } catch (e) {
    throw new TypeormMigrationErr(isError(e) ? e.message : 'Unknown err');
  }
};
