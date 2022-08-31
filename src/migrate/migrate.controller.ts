import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MigrateDto } from './dto/migrate.dto';
import { MigrateService } from './migrate.service';
import { MigrateResponse } from './responses/migrate.response';

@ApiTags('migrate')
@Controller('migrate')
export class MigrateController {
  constructor(private service: MigrateService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    operationId: 'migrate',
    summary: 'Migrate main endpoint',
  })
  @ApiOkResponse({ type: MigrateResponse })
  migrate(@Body() dto: MigrateDto): Promise<MigrateResponse> {
    return this.service.migrate(dto);
  }
}
