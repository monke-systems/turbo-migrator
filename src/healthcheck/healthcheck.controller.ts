import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('healthcheck')
@Controller('healthcheck')
export class HealthcheckController {
  @Get('ping')
  @ApiOperation({ operationId: 'ping' })
  @ApiOkResponse({ description: 'pong' })
  ping() {
    return 'pong';
  }
}
