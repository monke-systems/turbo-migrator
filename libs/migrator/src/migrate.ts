import { migratePlain } from './migrators/plain';
import { migrateTypeOrm } from './migrators/typeorm';
import type { MigrateOpts, MigrateResult } from './types';
import { MIGRATION_PROVIDER } from './types';

export const migrate = async (opts: MigrateOpts): Promise<MigrateResult> => {
  const result: MigrateResult = {};

  switch (opts.provider) {
    case MIGRATION_PROVIDER.TYPE_ORM:
      result.typeorm = await migrateTypeOrm({
        createDatabase: opts.createDatabase,
        connectionOpts: {
          type: opts.database,
          migrations: [opts.migrationFiles],
          username: opts.mysql!.user,
          ...opts.mysql,
        },
      });
      break;
    case MIGRATION_PROVIDER.PLAIN:
      result.plain = await migratePlain({
        createDatabase: opts.createDatabase,
        dbType: opts.database,
        mysql: opts.mysql,
        migrationsDirectory: opts.migrationFiles,
        migrateToFilename: opts.migrateTo,
      });
  }

  return result;
};
