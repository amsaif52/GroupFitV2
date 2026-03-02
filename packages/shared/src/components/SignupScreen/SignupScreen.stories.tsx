import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { SignupScreenWeb } from './SignupScreen.web';

const meta: Meta<typeof SignupScreenWeb> = {
  title: 'Shared/SignupScreen',
  component: SignupScreenWeb,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Shared signup screen (web). Same theme as LoginScreen.',
      },
    },
  },
  argTypes: {
    onSubmit: { action: 'submitted' },
    onLoginClick: { action: 'loginClicked' },
    onTermsClick: { action: 'termsClicked' },
  },
};

export default meta;

type Story = StoryObj<typeof SignupScreenWeb>;

export const Default: Story = {
  args: {},
};

export const WithSubtitle: Story = {
  args: {
    title: 'Set Up Your Account',
    subtitle: 'Customer',
  },
};

export const WithError: Story = {
  args: {
    error: 'Email already registered',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const WithTerms: Story = {
  args: {
    termsLabel: 'I agree to the',
    termsLinkText: 'Terms and Conditions',
    onTermsClick: () => {},
  },
};

export const WithLoginLink: Story = {
  args: {
    footerPrompt: 'Already a member?',
    footerLinkText: 'Log in',
    onLoginClick: () => {},
  },
};

export const SubmitCallsOnSubmit: Story = {
  args: {
    termsLabel: 'I agree to the',
    termsLinkText: 'Terms and Conditions',
    onTermsClick: () => {},
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('Name'), 'Jane Doe');
    await userEvent.type(canvas.getByPlaceholderText('Email'), 'jane@example.com');
    await userEvent.type(canvas.getByPlaceholderText('Password'), 'secret123');
    await userEvent.type(canvas.getByPlaceholderText('Confirm password'), 'secret123');
    await userEvent.click(canvas.getByRole('checkbox'));
    await userEvent.click(canvas.getByRole('button', { name: 'Create account' }));
    await expect(args.onSubmit).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
    });
  },
};
