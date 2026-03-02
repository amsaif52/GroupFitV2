import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from '@storybook/test';
import { OnboardingScreenWeb } from './OnboardingScreen.web';
import { ONBOARDING_SLIDES_CUSTOMER, ONBOARDING_SLIDES_TRAINER } from './onboardingSlides';

const meta: Meta<typeof OnboardingScreenWeb> = {
  title: 'Shared/OnboardingScreen',
  component: OnboardingScreenWeb,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Onboarding carousel (web version for Storybook). RN apps use OnboardingScreen from @groupfit/shared/components/native.',
      },
    },
  },
  argTypes: {
    onComplete: { action: 'completed' },
  },
};

export default meta;

type Story = StoryObj<typeof OnboardingScreenWeb>;

export const CustomerSlides: Story = {
  args: {
    slides: ONBOARDING_SLIDES_CUSTOMER,
    getStartedLabel: 'Get Started',
  },
};

export const TrainerSlides: Story = {
  args: {
    slides: ONBOARDING_SLIDES_TRAINER,
    getStartedLabel: "Let's begin",
  },
};

export const CustomLabels: Story = {
  args: {
    slides: ONBOARDING_SLIDES_CUSTOMER,
    getStartedLabel: 'Start',
    nextLabel: 'Next',
    skipLabel: 'Skip',
  },
};

export const SingleSlide: Story = {
  args: {
    slides: [{ titleBold: 'Welcome', titleRest: 'to GroupFit', subtitle: 'Get started below.' }],
    getStartedLabel: 'Get Started',
  },
};

export const SkipCallsOnComplete: Story = {
  args: {
    slides: ONBOARDING_SLIDES_CUSTOMER,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Skip' }));
    await expect(args.onComplete).toHaveBeenCalledTimes(1);
  },
};

export const GetStartedOnLastSlideCallsOnComplete: Story = {
  args: {
    slides: ONBOARDING_SLIDES_CUSTOMER,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Get Started' }));
    await expect(args.onComplete).toHaveBeenCalledTimes(1);
  },
};
