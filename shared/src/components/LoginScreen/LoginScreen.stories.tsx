import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { LoginScreenWeb } from './LoginScreen.web';

const meta: Meta<typeof LoginScreenWeb> = {
  title: 'Shared/LoginScreen',
  component: LoginScreenWeb,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Shared login screen (web). Same theme as newCustomer/newTrainer.',
      },
    },
  },
  argTypes: {
    onSubmit: { action: 'submitted' },
    onSignUpClick: { action: 'signUpClicked' },
    onGooglePress: { action: 'googleClicked' },
    onApplePress: { action: 'appleClicked' },
  },
};

export default meta;

type Story = StoryObj<typeof LoginScreenWeb>;

export const Default: Story = {
  args: {},
};

export const WithSubtitle: Story = {
  args: {
    title: 'Get Together.\nGet Fit.',
    subtitle: 'Customer',
  },
};

export const WithError: Story = {
  args: {
    error: 'Invalid email or password',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const WithSignUpLink: Story = {
  args: {
    footerPrompt: 'New here?',
    footerLinkText: 'Sign up now',
    onSignUpClick: () => {},
  },
};

export const SubmitCallsOnSubmit: Story = {
  args: {},
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('Email'), 'user@example.com');
    await userEvent.type(canvas.getByPlaceholderText('Password'), 'secret123');
    await userEvent.click(canvas.getByRole('button', { name: 'Login' }));
    await expect(args.onSubmit).toHaveBeenCalledWith('user@example.com', 'secret123');
  },
};

export const WithSocialButtons: Story = {
  args: {
    onGooglePress: () => {},
    onApplePress: () => {},
  },
};

export const AdminVariant: Story = {
  args: {
    variant: 'admin',
    title: 'Sign In',
    subtitle: 'Enter your email and password',
  },
};
