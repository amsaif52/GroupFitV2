import { createTamagui } from '@tamagui/core';
import { defaultConfig } from '@tamagui/config/v5';

const appConfig = createTamagui(defaultConfig);

export type AppConfig = typeof appConfig;

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Tamagui declaration merging
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig;
