import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { MIGRATION_PROVIDER } from '../migrate.types';
import { DATABASE } from '@app/migrator';

export class MigrationData {
  @ApiProperty({ example: '1648406661602-init.sql' })
  @IsString()
  filename!: string;

  @IsString()
  @ApiProperty({ example: 'CREATE TABLE `users` (`id` int)' })
  content!: string;
}

export class MysqlCreds {
  @ApiProperty({ example: 'localhost' })
  @IsString()
  host!: string;

  @ApiPropertyOptional({ example: 'localhost', default: 3306 })
  port: number = 3306;

  @ApiProperty({ example: 'test_db' })
  @IsString()
  database!: string;

  @ApiProperty({ example: 'root' })
  @IsString()
  user!: string;

  @ApiProperty({ example: '123321' })
  @IsString()
  password!: string;
}

export class MigrateDto {
  @ApiProperty({
    enum: MIGRATION_PROVIDER,
    enumName: 'MIGRATION_PROVIDER',
    example: MIGRATION_PROVIDER.PLAIN,
  })
  @IsEnum(MIGRATION_PROVIDER)
  provider!: MIGRATION_PROVIDER;

  @ApiProperty({
    enum: DATABASE,
    enumName: 'DATABASE',
    example: DATABASE.MYSQL,
  })
  @IsEnum(DATABASE)
  databaseType!: DATABASE;

  @ApiPropertyOptional({ type: MysqlCreds })
  @Type(() => MysqlCreds)
  @ValidateNested()
  @IsOptional()
  mysqlCreds?: MysqlCreds;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  createDatabase: boolean = false;

  @ApiPropertyOptional({ example: '1648406661602-init' })
  @MinLength(1)
  @IsOptional()
  migrateTo?: string;

  @ApiProperty({ isArray: true, type: MigrationData })
  @Type(() => MigrationData)
  @ValidateNested()
  migrations!: MigrationData[];
}
