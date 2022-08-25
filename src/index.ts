import { compileConfig } from '@monkee/turbo-config';
import { AppConfig } from './config';
import { executeCommands } from './execute-commands';

const main = async () => {
  const { config } = await compileConfig(AppConfig);

  const res = await executeCommands(config);

  console.log(res);
};

main().catch(console.error);
