import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import { Injectable } from '@nestjs/common';
import * as rimraf from 'rimraf';
import { generateRandomString } from '../shared/generate-random-string';
import type { MigrateDto } from './dto/migrate.dto';
import { Console } from '@app/logger';
import { migrate as turboMigrate, MIGRATION_PROVIDER } from '@app/migrator';
import type { MigrateResult } from '@app/migrator';

@Injectable()
export class MigrateService {
  async migrate(dto: MigrateDto): Promise<MigrateResult> {
    const tempDir = os.tmpdir();
    const rand = `turbo_migrator_${generateRandomString(25)}`;
    const migrationsDir = path.resolve(tempDir, rand);
    await fs.mkdir(migrationsDir);

    const tasks = dto.migrations.map((migration) => {
      const filepath = path.resolve(migrationsDir, migration.filename);
      return fs.writeFile(filepath, migration.content, 'utf-8');
    });

    await Promise.all(tasks);

    let res: MigrateResult | undefined;

    switch (dto.provider) {
      case MIGRATION_PROVIDER.PLAIN:
        res = await turboMigrate({
          provider: MIGRATION_PROVIDER.PLAIN,
          migrationFiles: `${migrationsDir}/*.sql`,
          createDatabase: dto.createDatabase,
          database: dto.databaseType,
          migrateTo: dto.migrateTo,
          mysql: dto.mysqlCreds,
        });
        break;
      case MIGRATION_PROVIDER.TYPE_ORM:
        res = await turboMigrate({
          provider: MIGRATION_PROVIDER.TYPE_ORM,
          migrationFiles: `${migrationsDir}/*.ts`,
          createDatabase: dto.createDatabase,
          database: dto.databaseType,
          migrateTo: dto.migrateTo,
          mysql: dto.mysqlCreds,
        });
        break;
    }

    rimraf(migrationsDir, (err) => {
      if (err !== null) {
        Console.error(err);
      }
    });

    return res!;
  }
}
