import type { Meta, StoryObj } from '@storybook/react';
import { SplashScreenWeb } from './SplashScreen.web';

const meta: Meta<typeof SplashScreenWeb> = {
  title: 'Shared/SplashScreen',
  component: SplashScreenWeb,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'App splash screen with logo/title, optional version, subtitle, and loading spinner.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SplashScreenWeb>;

export const Default: Story = {
  args: {
    title: 'GroupFit',
  },
};

export const WithVersion: Story = {
  args: {
    title: 'GroupFit',
    version: '1.0.0',
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'GroupFit',
    subtitle: 'Customer',
    version: '1.0.0',
  },
};

export const Loading: Story = {
  args: {
    title: 'GroupFit',
    loading: true,
  },
};

export const Trainer: Story = {
  args: {
    title: 'GroupFit',
    subtitle: 'Trainer',
    version: '1.0.0',
    loading: true,
  },
};
