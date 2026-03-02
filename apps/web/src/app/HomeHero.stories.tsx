import type { Meta, StoryObj } from '@storybook/react';
import { H1, Paragraph, YStack } from 'tamagui';

const meta: Meta = {
  title: 'UI/HomeHero',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Hero section for the home page (title + subtitle).',
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => (
    <YStack padding="$4" maxWidth={600} gap="$3">
      <H1 size="$8">GroupFit</H1>
      <Paragraph theme="alt2" size="$4">
        Sign in as admin, trainer, or customer.
      </Paragraph>
    </YStack>
  ),
};
