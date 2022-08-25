import { compileConfig, compileConfigSync } from '@monkee/turbo-config';
import * as mysql from 'mysql2/promise';
import { AppConfig } from '../src/config';
import { TypeormMigrationErr } from '../src/errors';
import { executeCommands } from '../src/execute-commands';
import { E2EConfig } from './utils/e2e-config';
import {
  deleteTestDatabase,
  generateDatabaseName,
  getMigrationsDir,
  MIGRATIONS_DIR,
  setEnvs,
} from './utils/test-utils';

describe('Typeorm migrations (e2e)', () => {
  let mysqlConnection: mysql.Connection | undefined;
  let currentDatabaseName = '';

  beforeEach(async () => {
    currentDatabaseName = generateDatabaseName();
    setEnvs(['MYSQL_DATABASE', currentDatabaseName]);

    const { config } = compileConfigSync(E2EConfig);
    const { database, username, ...withoutDatabase } = config.mysql;
    mysqlConnection = await mysql.createConnection(withoutDatabase);
  });

  afterEach(async () => {
    await deleteTestDatabase(mysqlConnection!, currentDatabaseName);

    await mysqlConnection!.end();
  });

  it('Should migrate database', async () => {
    setEnvs(['COMMANDS', 'migrate']);
    setEnvs(['MIGRATION_PROVIDER', 'typeorm']);
    setEnvs(['CREATE_DATABASE', 'true']);
    setEnvs(['MIGRATION_FILES', getMigrationsDir(MIGRATIONS_DIR.TYPE_ORM)]);

    const { config } = await compileConfig(AppConfig);

    const res = await executeCommands(config);

    expect(res.migration?.typeorm?.appliedMigrations).toHaveLength(2);
  });

  it('Should throw error on invalid credentials', async () => {
    setEnvs(['COMMANDS', 'migrate']);
    setEnvs(['MIGRATION_PROVIDER', 'typeorm']);
    setEnvs(['CREATE_DATABASE', 'true']);
    setEnvs(['MIGRATION_FILES', getMigrationsDir(MIGRATIONS_DIR.TYPE_ORM)]);
    setEnvs(['MYSQL_PASSWORD', 'wrong_pass']);

    const { config } = await compileConfig(AppConfig);

    const fn = () => executeCommands(config);

    await expect(fn).rejects.toThrowError(TypeormMigrationErr);
  });
});
