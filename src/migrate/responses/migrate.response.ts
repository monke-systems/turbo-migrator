import { ApiProperty } from '@nestjs/swagger';
import type { MigrateResult } from '@app/migrator';
import { MigratePlainResult, TypeOrmMigrateResult } from '@app/migrator';

export class MigrateResponse implements MigrateResult {
  @ApiProperty()
  typeorm?: TypeOrmMigrateResult;

  @ApiProperty()
  plain?: MigratePlainResult;
}
