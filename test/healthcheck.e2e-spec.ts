import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AppConfig } from '../src/config';
import { Console } from '@app/logger';

describe('Healthcheck (e2e)', () => {
  let app: INestApplication;
  let conf: AppConfig;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    conf = app.get(AppConfig);

    Console.setConfig(conf.logging);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('Ping pong endpoint', () => {
    return request(app.getHttpServer()).get('/healthcheck/ping').expect('pong');
  });
});
