import { ConfigField } from '@monkee/turbo-config';
import { IsEnum, IsOptional } from 'class-validator';

export enum MIGRATION_PROVIDER {
  TYPE_ORM = 'typeorm',
  DIRECTORY = 'directory',
}

export enum DIRECTORY_PROVIDER_DATABASE {
  MYSQL = 'mysql',
}

export enum COMMAND {
  MIGRATE = 'migrate',
}

export class MysqlConfig {
  @ConfigField()
  @IsOptional()
  database?: string;

  @ConfigField()
  host!: string;

  @ConfigField()
  port: number = 3306;

  @ConfigField()
  user!: string;

  // Same as user, for some libraries
  @ConfigField({ genericKey: 'user' })
  username!: string;

  @ConfigField()
  password!: string;
}

export class AppConfig {
  @ConfigField({ arrayOf: 'strings' })
  @IsEnum(COMMAND, { each: true })
  commands!: COMMAND[];

  @ConfigField()
  @IsEnum(MIGRATION_PROVIDER)
  migrationProvider!: MIGRATION_PROVIDER;

  @ConfigField({ nested: true })
  mysql!: MysqlConfig;

  @ConfigField()
  migrationFiles!: string;

  @ConfigField()
  createDatabase: boolean = false;
}
