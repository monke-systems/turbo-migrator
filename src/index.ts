import * as util from 'util';
import { compileConfig } from '@monkee/turbo-config';
import { AppConfig } from './config';
import { executeCommands } from './execute-commands';

const main = async () => {
  const { config } = await compileConfig(AppConfig);

  const res = await executeCommands(config);

  util.format(res);
};

main().catch(console.error);
