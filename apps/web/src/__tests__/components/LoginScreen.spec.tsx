import { render, screen, fireEvent } from '@testing-library/react';
import { LoginScreen } from '@groupfit/shared/components';

describe('LoginScreen', () => {
  it('renders title and subtitle', () => {
    render(<LoginScreen onSubmit={() => {}} />);
    expect(screen.getByText(/Get Together/)).toBeInTheDocument();
    expect(screen.getByText('Login to your account')).toBeInTheDocument();
  });

  it('renders email and password inputs and submit button', () => {
    render(<LoginScreen onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('calls onSubmit with email and password on submit', async () => {
    const onSubmit = jest.fn();
    render(<LoginScreen onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('test@example.com', 'secret');
  });

  it('shows error when error prop is set', () => {
    render(<LoginScreen onSubmit={() => {}} error="Invalid credentials" />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('disables submit and shows loading label when loading', () => {
    render(<LoginScreen onSubmit={() => {}} loading />);
    const button = screen.getByRole('button', { name: 'Loading...' });
    expect(button).toBeDisabled();
  });

  it('renders sign up link when onSignUpClick is provided', () => {
    const onSignUpClick = jest.fn();
    render(<LoginScreen onSubmit={() => {}} onSignUpClick={onSignUpClick} />);
    expect(screen.getByText('New here?')).toBeInTheDocument();
    const signUpButton = screen.getByRole('button', { name: 'Sign up now' });
    fireEvent.click(signUpButton);
    expect(onSignUpClick).toHaveBeenCalledTimes(1);
  });

  it('allows custom labels', () => {
    render(
      <LoginScreen
        onSubmit={() => {}}
        title="Welcome"
        subtitle="Sign in below"
        emailLabel="E-mail"
        passwordLabel="Pass"
        submitLabel="Sign in"
      />
    );
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Sign in below')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('E-mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pass')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('shows social buttons when onGooglePress and onApplePress are provided', () => {
    const onGooglePress = jest.fn();
    const onApplePress = jest.fn();
    render(
      <LoginScreen onSubmit={() => {}} onGooglePress={onGooglePress} onApplePress={onApplePress} />
    );
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('calls onGooglePress when Continue with Google is clicked', () => {
    const onGooglePress = jest.fn();
    render(
      <LoginScreen onSubmit={() => {}} onGooglePress={onGooglePress} onApplePress={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(onGooglePress).toHaveBeenCalledTimes(1);
  });

  it('calls onApplePress when Continue with Apple is clicked', () => {
    const onApplePress = jest.fn();
    render(
      <LoginScreen onSubmit={() => {}} onGooglePress={() => {}} onApplePress={onApplePress} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Apple' }));
    expect(onApplePress).toHaveBeenCalledTimes(1);
  });

  it('when phone login is enabled, phone tab shows country code dropdown and phone input', () => {
    render(
      <LoginScreen
        onSubmit={() => {}}
        onSendOtp={async () => ({ message: 'ok', userCode: 'uc' })}
        onVerifyOtp={async () => ({
          accessToken: 't',
          user: { id: '1', email: 'e', role: 'customer', locale: 'en' },
        })}
      />
    );
    expect(screen.getByRole('tab', { name: /phone/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /email/i })).toBeInTheDocument();
    const countrySelect = screen.getByRole('combobox', { name: 'Country code' });
    expect(countrySelect).toBeInTheDocument();
    expect(countrySelect.tagName).toBe('SELECT');
    expect(screen.getByPlaceholderText('Phone number')).toBeInTheDocument();
  });

  it('uses countryOptions for phone prefix when provided', () => {
    const countryOptions = [
      { code: 'x', dial: '+99', name: 'Testland' },
      { code: 'y', dial: '+11', name: 'Other' },
    ];
    render(
      <LoginScreen
        onSubmit={() => {}}
        countryOptions={countryOptions}
        onSendOtp={async () => ({ message: 'ok', userCode: 'uc' })}
        onVerifyOtp={async () => ({
          accessToken: 't',
          user: { id: '1', email: 'e', role: 'customer', locale: 'en' },
        })}
      />
    );
    const countrySelect = screen.getByRole('combobox', { name: 'Country code' });
    expect(countrySelect).toBeInTheDocument();
    expect(countrySelect).toHaveDisplayValue(/\+99|Testland/);
  });
});
