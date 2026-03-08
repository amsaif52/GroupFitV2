import { createTamagui } from '@tamagui/core';
import { config as defaultConfig } from '@tamagui/config';

const appConfig = createTamagui(defaultConfig);

export type AppConfig = typeof appConfig;

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Tamagui declaration merging
  interface TamaguiCustomConfig extends AppConfig {}
}

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Tamagui declaration merging
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;
