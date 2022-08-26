import type { AppConfig } from './config';
import {
  DIRECTORY_PROVIDER_DATABASE,
  COMMAND,
  MIGRATION_PROVIDER,
} from './config';
import type { MigrateFromDirectoryResult } from './migrators/directory';
import { migrateFromDirectory } from './migrators/directory';
import type { TypeOrmMigrateResult } from './migrators/typeorm';
import { migrateTypeOrm } from './migrators/typeorm';

type ExecuteCommandsResult = {
  migration?: {
    typeorm?: TypeOrmMigrateResult;
    directory?: MigrateFromDirectoryResult;
  };
};

export const executeCommands = async (
  config: AppConfig,
): Promise<ExecuteCommandsResult> => {
  const results: ExecuteCommandsResult = {};

  if (config.commands.includes(COMMAND.MIGRATE)) {
    results.migration = {};
    switch (config.migrationProvider) {
      case MIGRATION_PROVIDER.TYPE_ORM:
        results.migration.typeorm = await migrateTypeOrm({
          createDatabase: config.createDatabase,
          datasource: {
            type: 'mariadb',
            migrations: [config.migrationFiles],
            ...config.mysql,
          },
        });
        break;
      case MIGRATION_PROVIDER.DIRECTORY:
        results.migration.directory = await migrateFromDirectory({
          createDatabase: config.createDatabase,
          dbType: DIRECTORY_PROVIDER_DATABASE.MYSQL,
          mysql: config.mysql,
          migrationsDirectory: config.migrationFiles,
          migrateToFilename: config.migrateTo,
        });
    }
  }

  return results;
};
