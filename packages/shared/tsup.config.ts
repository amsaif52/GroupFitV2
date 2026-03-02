import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'components/index.native': 'src/components/index.native.ts',
    'utils/index': 'src/utils/index.ts',
    'i18n/index': 'src/i18n/index.ts',
    'api/index': 'src/api/index.ts',
    'timezone/index': 'src/timezone/index.ts',
    'theme/index': 'src/theme/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
