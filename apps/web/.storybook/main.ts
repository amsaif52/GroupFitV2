import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  // Stories can live anywhere under src/ (e.g. src/app/**/*.stories.tsx)
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;
