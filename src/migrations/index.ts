import * as migration_20261018_190359_initial from './20261018_190359_initial';
import * as migration_20261019_020612_page_layouts from './20261019_020612_page_layouts';
import * as migration_20261021_222125 from './20261021_222125';
import * as migration_20261022_artikel_embeddings from './20261022_artikel_embeddings';
import * as migration_20261023_artikel_embeddings_local from './20261023_artikel_embeddings_local';
import * as migration_20261023_testimoni_foto_profil from './20261023_testimoni_foto_profil';

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
    name: '20261021_222125',
  },
  {
    up: migration_20261022_artikel_embeddings.up,
    down: migration_20261022_artikel_embeddings.down,
    name: '20261022_artikel_embeddings',
  },
  {
    up: migration_20261023_artikel_embeddings_local.up,
    down: migration_20261023_artikel_embeddings_local.down,
    name: '20261023_artikel_embeddings_local',
  },
  {
    up: migration_20261023_testimoni_foto_profil.up,
    down: migration_20261023_testimoni_foto_profil.down,
    name: '20261023_testimoni_foto_profil',
  },
];
