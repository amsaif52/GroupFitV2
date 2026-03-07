import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingScreen, ONBOARDING_SLIDES_CUSTOMER } from '@groupfit/shared/components';

describe('OnboardingScreen', () => {
  it('renders first slide content', () => {
    render(<OnboardingScreen slides={ONBOARDING_SLIDES_CUSTOMER} onComplete={() => {}} />);
    expect(screen.getByText('Pick')).toBeInTheDocument();
    expect(screen.getByText('the activity and trainer')).toBeInTheDocument();
    expect(screen.getByText('for your group')).toBeInTheDocument();
  });

  it('renders Skip, Next and dot indicators', () => {
    render(<OnboardingScreen slides={ONBOARDING_SLIDES_CUSTOMER} onComplete={() => {}} />);
    expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('calls onComplete when Skip is clicked', () => {
    const onComplete = jest.fn();
    render(<OnboardingScreen slides={ONBOARDING_SLIDES_CUSTOMER} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('shows Get Started on last slide and calls onComplete when clicked', () => {
    const onComplete = jest.fn();
    render(
      <OnboardingScreen
        slides={[{ titleBold: 'Last', titleRest: 'slide', subtitle: 'Done.' }]}
        onComplete={onComplete}
        getStartedLabel="Get Started"
      />
    );
    expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('Next advances to next slide; on last slide button shows getStartedLabel and completes', () => {
    const onComplete = jest.fn();
    render(
      <OnboardingScreen
        slides={ONBOARDING_SLIDES_CUSTOMER}
        onComplete={onComplete}
        getStartedLabel="Get Started"
      />
    );
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Get Started' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('allows custom skip and next labels', () => {
    render(
      <OnboardingScreen
        slides={ONBOARDING_SLIDES_CUSTOMER}
        onComplete={() => {}}
        skipLabel="Skip intro"
        nextLabel="Continue"
      />
    );
    expect(screen.getByRole('button', { name: 'Skip intro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });
});
