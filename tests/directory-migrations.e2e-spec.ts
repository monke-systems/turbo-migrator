import { compileConfig, compileConfigSync } from '@monkee/turbo-config';
import * as mysql from 'mysql2/promise';
import { AppConfig } from '../src/config';
import { executeCommands } from '../src/execute-commands';
import { E2EConfig } from './utils/e2e-config';
import {
  deleteTestDatabase,
  generateDatabaseName,
  getMigrationsDir,
  MIGRATIONS_DIR,
  setEnvs,
} from './utils/test-utils';

describe('Directory migrations (e2e)', () => {
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

  it('Should migrate database from directory', async () => {
    setEnvs(['COMMANDS', 'migrate']);
    setEnvs(['MIGRATION_PROVIDER', 'directory']);
    setEnvs(['CREATE_DATABASE', 'true']);
    setEnvs(['MIGRATION_FILES', getMigrationsDir(MIGRATIONS_DIR.DIRECTORY)]);

    const { config } = await compileConfig(AppConfig);

    const res = await executeCommands(config);

    expect(res.migration?.directory?.appliedFiles).toHaveLength(2);

    await mysqlConnection!.query(`USE ${currentDatabaseName}`);
    const testInsert = () =>
      mysqlConnection!.query('INSERT INTO transactions SET ?', [
        {
          id: '20354d7a-e4fe-47af-8ff6-187bca92f3f9',
          isBotTransaction: true,
        },
      ]);

    await expect(testInsert()).resolves.not.toThrow();
  });
});
