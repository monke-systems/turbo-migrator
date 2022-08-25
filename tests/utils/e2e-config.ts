import { ConfigField } from '@monkee/turbo-config';
import { MysqlConfig } from '../../src/config';

export class E2EConfig {
  @ConfigField({ nested: true })
  mysql!: MysqlConfig;
}
