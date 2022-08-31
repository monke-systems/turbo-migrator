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

  afterEach(async () => {
    await app.close();
    await deleteMysqlTestDatabase(mysqlConnection!, currentDatabaseName);
    await mysqlConnection!.end();
  });

  it('Should migrate mysql database from plain migrations', async () => {
    const requestBody = {
      provider: MIGRATION_PROVIDER.PLAIN,
      databaseType: DATABASE.MYSQL,
      createDatabase: true,
      mysqlCreds: {
        ...getMysqlCreds(),
        database: currentDatabaseName,
      },
      migrations: await getMigrationsFromDir(MIGRATIONS_DIR.PLAIN),
    };

    const { body } = await request(app.getHttpServer())
      .post(url)
      .send(requestBody)
      .expect(200);

    expect(body.plain.appliedFiles).toHaveLength(3);

    await mysqlConnection!.query(`USE ${currentDatabaseName}`);

    const fn = () =>
      mysqlConnection?.query('INSERT INTO transactions SET ?', [
        { id: '12312', someField: false },
      ]);

    await expect(fn()).resolves.not.toThrow();
  });

  it('Double mysql migration from directory', async () => {
    const requestBody = {
      provider: MIGRATION_PROVIDER.PLAIN,
      databaseType: DATABASE.MYSQL,
      createDatabase: true,
      mysqlCreds: {
        ...getMysqlCreds(),
        database: currentDatabaseName,
      },
      migrations: await getMigrationsFromDir(MIGRATIONS_DIR.PLAIN),
    };

    await request(app.getHttpServer()).post(url).send(requestBody).expect(200);

    const { body } = await request(app.getHttpServer())
      .post(url)
      .send(requestBody)
      .expect(200);

    expect(body.plain.appliedFiles).toHaveLength(0);
  });

  it('Step by step mysql migration from directory', async () => {
    const requestBody1 = {
      provider: MIGRATION_PROVIDER.PLAIN,
      databaseType: DATABASE.MYSQL,
      createDatabase: true,
      mysqlCreds: {
        ...getMysqlCreds(),
        database: currentDatabaseName,
      },
      migrateTo: '1562586898-second',
      migrations: await getMigrationsFromDir(MIGRATIONS_DIR.PLAIN),
    };

    const { body: body1 } = await request(app.getHttpServer())
      .post(url)
      .send(requestBody1)
      .expect(200);

    expect(body1.plain.appliedFiles).toHaveLength(2);

    const requestBody2 = {
      provider: MIGRATION_PROVIDER.PLAIN,
      databaseType: DATABASE.MYSQL,
      createDatabase: true,
      mysqlCreds: {
        ...getMysqlCreds(),
        database: currentDatabaseName,
      },
      migrations: await getMigrationsFromDir(MIGRATIONS_DIR.PLAIN),
    };

    const { body: body2 } = await request(app.getHttpServer())
      .post(url)
      .send(requestBody2)
      .expect(200);

    expect(body2.plain.appliedFiles).toHaveLength(1);
  });
});
