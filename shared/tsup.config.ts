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
  // Don't bundle react-native (uses Flow/import typeof); consumers provide it.
  // react-hook-form and @hookform/resolvers are optional (web only); web app provides them.
  external: [
    'react',
    'react-native',
    'react-hook-form',
    '@hookform/resolvers',
    '@hookform/resolvers/zod',
  ],
});
