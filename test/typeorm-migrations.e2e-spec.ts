import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type * as mysql from 'mysql2/promise';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AppConfig } from '../src/config';
import {
  deleteMysqlTestDatabase,
  generateDatabaseName,
  getMigrationsFromDir,
  getMysqlConnection,
  getMysqlCreds,
  MIGRATIONS_DIR,
} from './utils/test-utils';
import { Console } from '@app/logger';
import { DATABASE, MIGRATION_PROVIDER } from '@app/migrator';

const url = '/migrate';

describe('Plain migrations (e2e)', () => {
  let app: INestApplication;
  let conf: AppConfig;
  let mysqlConnection: mysql.Connection | undefined;
  let currentDatabaseName = '';

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    conf = app.get(AppConfig);

    Console.setConfig(conf.logging);

    currentDatabaseName = generateDatabaseName();
    mysqlConnection = await getMysqlConnection();

    await app.init();
  });

  it('Should migrate mysql database from typeorm migrations', async () => {
    const requestBody = {
      provider: MIGRATION_PROVIDER.TYPE_ORM,
      databaseType: DATABASE.MYSQL,
      createDatabase: true,
      mysqlCreds: {
        ...getMysqlCreds(),
        database: currentDatabaseName,
      },
      migrations: await getMigrationsFromDir(MIGRATIONS_DIR.TYPE_ORM),
    };

    const { body } = await request(app.getHttpServer())
      .post(url)
      .send(requestBody)
      .expect(200);

    expect(body.typeorm.appliedMigrations).toHaveLength(2);
  });

  afterEach(async () => {
    await app.close();
    await deleteMysqlTestDatabase(mysqlConnection!, currentDatabaseName);
    await mysqlConnection!.end();
  });
});
