import * as migration_20260330_153328 from './20260330_153328';
import * as migration_20260331_062750 from './20260331_062750';
import * as migration_20260405_085111_add_brands from './20260405_085111_add_brands';

export const migrations = [
  {
    up: migration_20260330_153328.up,
    down: migration_20260330_153328.down,
    name: '20260330_153328',
  },
  {
    up: migration_20260331_062750.up,
    down: migration_20260331_062750.down,
    name: '20260331_062750',
  },
  {
    up: migration_20260405_085111_add_brands.up,
    down: migration_20260405_085111_add_brands.down,
    name: '20260405_085111_add_brands'
  },
];
