import { ConfigField } from '@monkee/turbo-config';
import { Injectable } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import type { ConsoleConfig } from '@app/logger';
import { CONTEXT } from '@app/logger';

export enum NODE_ENV {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

@Injectable()
export class GeneralConfig {
  @ConfigField()
  port: number = 3000;

  @ConfigField({ envKey: 'NODE_ENV' })
  @IsEnum(NODE_ENV)
  env: NODE_ENV = NODE_ENV.PRODUCTION;

  @ConfigField()
  version: string = 'local_version';

  @ConfigField()
  @IsOptional()
  corsOrigin?: string;
}

@Injectable()
export class LoggingConfig implements ConsoleConfig {
  @ConfigField({ arrayOf: 'strings' })
  @IsEnum(CONTEXT, { each: true })
  enabledContexts: CONTEXT[] = [];

  @ConfigField({ arrayOf: 'strings' })
  @IsEnum(CONTEXT, { each: true })
  disabledContexts: CONTEXT[] = [];

  @ConfigField()
  allContextsEnabled: boolean = true;

  @ConfigField()
  colors: boolean = false;
}

@Injectable()
export class AppConfig {
  @ConfigField({ nested: true })
  app!: GeneralConfig;

  @ConfigField({ nested: true, nestedKey: 'log' })
  logging!: LoggingConfig;
}
