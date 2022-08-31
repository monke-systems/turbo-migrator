import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { HealthcheckController } from './healthcheck.controller';

describe('HealthheckController', () => {
  let controller: HealthcheckController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthcheckController],
    }).compile();

    controller = module.get<HealthcheckController>(HealthcheckController);
  });

  it('Ping pong', () => {
    expect(controller.ping()).toStrictEqual('pong');
  });
});
