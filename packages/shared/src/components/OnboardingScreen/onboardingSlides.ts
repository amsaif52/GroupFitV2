import type { OnboardingSlideBase } from './types';

/** Customer onboarding copy (from newCustomer): Pick / Train / Split */
export const ONBOARDING_SLIDES_CUSTOMER: OnboardingSlideBase[] = [
  {
    titleBold: 'Pick',
    titleRest: 'the activity and trainer',
    subtitle: 'for your group',
  },
  {
    titleBold: 'Train',
    titleRest: 'at your preferred',
    subtitle: 'spot and time',
  },
  {
    titleBold: 'Split',
    titleRest: 'the cost with',
    subtitle: 'your group',
  },
];

/** Trainer onboarding copy (from newTrainer): Connect / Coach / Get paid */
export const ONBOARDING_SLIDES_TRAINER: OnboardingSlideBase[] = [
  {
    titleBold: 'Connect',
    titleRest: 'with your',
    subtitle: 'trainees',
  },
  {
    titleBold: 'Coach',
    titleRest: 'at the decided',
    subtitle: 'spot and time',
  },
  {
    titleBold: 'Get paid',
    titleRest: 'right after',
    subtitle: 'your session',
  },
];
