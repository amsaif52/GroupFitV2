import type { Meta, StoryObj } from '@storybook/react';
import { Button, YStack } from 'tamagui';
import { ROLES } from '@groupfit/shared';

const meta: Meta<typeof Button> = {
  title: 'UI/RoleButtons',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Tamagui buttons used for role selection on the home page.',
      },
    },
  },
};

export default meta;

export const AllRoles: StoryObj = {
  render: () => (
    <YStack gap="$2" flexDirection="row" flexWrap="wrap">
      <Button theme="blue" size="$3">
        {ROLES.ADMIN}
      </Button>
      <Button theme="green" size="$3">
        {ROLES.TRAINER}
      </Button>
      <Button theme="orange" size="$3">
        {ROLES.CUSTOMER}
      </Button>
    </YStack>
  ),
};

export const Blue: StoryObj = {
  render: () => (
    <Button theme="blue" size="$3">
      Admin
    </Button>
  ),
};

export const Green: StoryObj = {
  render: () => (
    <Button theme="green" size="$3">
      Trainer
    </Button>
  ),
};

export const Orange: StoryObj = {
  render: () => (
    <Button theme="orange" size="$3">
      Customer
    </Button>
  ),
};
