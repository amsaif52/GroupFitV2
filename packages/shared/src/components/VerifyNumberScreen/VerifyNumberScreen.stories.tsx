import type { Meta, StoryObj } from '@storybook/react';
import { VerifyNumberScreenWeb } from './VerifyNumberScreen.web';

const meta: Meta<typeof VerifyNumberScreenWeb> = {
  title: 'Shared/VerifyNumberScreen',
  component: VerifyNumberScreenWeb,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'OTP verification screen. Enter 4-digit code, resend with cooldown.',
      },
    },
  },
  argTypes: {
    onVerify: { action: 'verify' },
    onResend: { action: 'resend' },
    onBack: { action: 'back' },
  },
};

export default meta;

type Story = StoryObj<typeof VerifyNumberScreenWeb>;

export const Default: Story = {
  args: {
    phoneNumber: '+44 7700 900000',
    onBack: () => {},
  },
};

export const WithCooldown: Story = {
  args: {
    phoneNumber: '+44 7700 900123',
    resendCooldownSeconds: 45,
    onBack: () => {},
  },
};

export const WithError: Story = {
  args: {
    phoneNumber: '+44 7700 900456',
    error: 'Invalid or expired code. Please request a new one.',
    onBack: () => {},
  },
};

export const Loading: Story = {
  args: {
    phoneNumber: '+44 7700 900789',
    loading: true,
    onBack: () => {},
  },
};
