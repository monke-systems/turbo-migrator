import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './config';
import { Console, CONTEXT } from '@app/logger';

async function bootstrap() {
  // disable default logger colors
  process.env.NO_COLOR = 'true';

  const app = await NestFactory.create(AppModule, {
    bufferLogs: false,
  });

  const conf = app.get(AppConfig);

  Console.setConfig(conf.logging);
  app.useLogger(new Console());

  if (conf.app.corsOrigin !== undefined) {
    app.enableCors({
      origin: conf.app.corsOrigin,
    });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.use(helmet.default());
  app.enableShutdownHooks();
  app.use(json({ limit: '50mb' }));

  startSwagger(app, conf);
  await app.listen(conf.app.port);

  const appUrl = await app.getUrl();

  Console.log('All systems nominal', CONTEXT.BOOTSTRAP);
  Console.log(`App version - ${conf.app.version}`, CONTEXT.BOOTSTRAP);
  Console.log(`Swagger doc is available at ${appUrl}/doc/#`, CONTEXT.BOOTSTRAP);
  Console.log(`Listening on ${appUrl}`, CONTEXT.BOOTSTRAP);
}

function startSwagger(app: INestApplication, conf: AppConfig) {
  const optionsBuilder = new DocumentBuilder()
    .setTitle('Turbo migrator')
    .setDescription('API description')
    .setVersion(conf.app.version);

  const options = optionsBuilder.build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
