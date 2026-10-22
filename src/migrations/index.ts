import * as migration_20261018_190359_initial from './20261018_190359_initial';
import * as migration_20261019_020612_page_layouts from './20261019_020612_page_layouts';
import * as migration_20261021_222125 from './20261021_222125';

export const migrations = [
  {
    up: migration_20261018_190359_initial.up,
    down: migration_20261018_190359_initial.down,
    name: '20261018_190359_initial',
  },
  {
    up: migration_20261019_020612_page_layouts.up,
    down: migration_20261019_020612_page_layouts.down,
    name: '20261019_020612_page_layouts',
  },
  {
    up: migration_20261021_222125.up,
    down: migration_20261021_222125.down,
    name: '20261021_222125'
  },
];
