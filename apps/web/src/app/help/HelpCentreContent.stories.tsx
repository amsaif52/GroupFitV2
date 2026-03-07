import type { Meta, StoryObj } from '@storybook/react';
import { HelpCentreContent } from './HelpCentreContent';

const meta: Meta<typeof HelpCentreContent> = {
  title: 'App/HelpCentre',
  component: HelpCentreContent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Help Centre screen with FAQs and Contact us tabs.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof HelpCentreContent>;

export const Default: Story = {
  args: {
    backLink: <a href="#">← Dashboard</a>,
  },
};

export const ContactTab: Story = {
  args: {
    backLink: <a href="#">← Dashboard</a>,
  },
  decorators: [
    (Story) => {
      // Force Contact us tab to be visible by rendering and then we show both in story
      return <Story />;
    },
  ],
};

export const CustomFaqs: Story = {
  args: {
    title: 'Help Centre',
    faqs: [
      {
        id: '1',
        question: 'How do I reset my password?',
        description: 'Go to Login and use the Forgot password link.',
      },
      {
        id: '2',
        question: 'How do I delete my account?',
        description: 'Open Account and tap Delete account.',
      },
    ],
    contactList: [{ heading: 'Email support', link: 'mailto:support@groupfitapp.com' }],
    backLink: <a href="#">← Back</a>,
  },
};
