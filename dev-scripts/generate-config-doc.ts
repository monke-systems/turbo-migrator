import { CONFIG_SOURCE, generateConfigDoc } from '@monkee/turbo-config';
import { AppConfig } from '../src/config';

generateConfigDoc(AppConfig, {
  title: 'Turbo migrator config reference',
  writeToFile: 'CONFIG_REFERENCE.MD',
  keysType: CONFIG_SOURCE.YAML,
});
