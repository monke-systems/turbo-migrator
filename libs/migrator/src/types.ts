import type { Migration } from 'typeorm';

export enum MIGRATION_PROVIDER {
  TYPE_ORM = 'typeorm',
  PLAIN = 'plain',
}

export enum DATABASE {
  MYSQL = 'mysql',
}
export type MysqlCreds = {
  database: string;
  host: string;
  port: number;
  user: string;
  password: string;
};

export type MigrateOpts = {
  provider: MIGRATION_PROVIDER;
  database: DATABASE;
  mysql?: MysqlCreds;
  createDatabase: boolean;
  migrationFiles: string;
  migrateTo?: string;
};

export type TypeOrmMigrateResult = {
  appliedMigrations: Migration[];
  log: string[];
};

export type MigratePlainResult = {
  appliedFiles: string[];
  log: string[];
};

export type MigrateResult = {
  typeorm?: TypeOrmMigrateResult;
  plain?: MigratePlainResult;
};
