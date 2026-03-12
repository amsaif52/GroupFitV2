import { render, screen, fireEvent } from '@testing-library/react';
import { SignupScreen } from '@groupfit/shared/components';

function fillSignupFormAndSubmit(overrides?: {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  state?: string;
}) {
  const name = overrides?.name ?? 'Jane Doe';
  const email = overrides?.email ?? 'jane@example.com';
  const phone = overrides?.phone ?? '7700900123';
  const country = overrides?.country ?? 'US';
  const state = overrides?.state ?? 'AL';
  fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: name } });
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText('Phone number'), { target: { value: phone } });
  const comboboxes = screen.getAllByRole('combobox');
  fireEvent.change(comboboxes[1], { target: { value: country } });
  const afterCountry = screen.getAllByRole('combobox');
  if (afterCountry.length >= 4) {
    fireEvent.change(afterCountry[2], { target: { value: state } });
  } else {
    const stateInput = screen.getByPlaceholderText(/State|Province|Region/i);
    fireEvent.change(stateInput, { target: { value: state } });
  }
  fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('SignupScreen', () => {
  it('renders title and form fields', () => {
    render(<SignupScreen onSubmit={() => {}} />);
    expect(screen.getByText('Set Up Your Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone number')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Country code' })).toBeInTheDocument();
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onSubmit with form data when all required fields are filled', () => {
    const onSubmit = jest.fn();
    render(<SignupScreen onSubmit={onSubmit} />);
    fillSignupFormAndSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.name).toBe('Jane Doe');
    expect(payload.email).toBe('jane@example.com');
    expect(payload.country).toBe('US');
    expect(payload.state).toBe('AL');
    expect(payload.role).toBe('customer');
    expect(payload.phone).toMatch(/^\+?\d+/);
  });

  it('shows field error when required field is missing', () => {
    const onSubmit = jest.fn();
    render(<SignupScreen onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Phone number'), {
      target: { value: '7700900123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Country is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows error when terms required but not accepted', () => {
    const onSubmit = jest.fn();
    render(
      <SignupScreen
        onSubmit={onSubmit}
        termsLabel="I agree to the"
        termsLinkText="Terms"
        onTermsClick={() => {}}
      />
    );
    fillSignupFormAndSubmit({ name: 'Jane' });
    expect(screen.getByText('Please accept the terms to continue')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when terms accepted', () => {
    const onSubmit = jest.fn();
    render(
      <SignupScreen
        onSubmit={onSubmit}
        termsLabel="I agree to the"
        termsLinkText="Terms"
        onTermsClick={() => {}}
      />
    );
    fillSignupFormAndSubmit({ name: 'Jane' });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.name).toBe('Jane');
    expect(payload.email).toBe('jane@example.com');
    expect(payload.country).toBe('US');
    expect(payload.state).toBe('AL');
    expect(payload.role).toBe('customer');
  });

  it('shows server error when error prop is set', () => {
    render(<SignupScreen onSubmit={() => {}} error="Email already registered" />);
    expect(screen.getByText('Email already registered')).toBeInTheDocument();
  });

  it('disables submit when loading', () => {
    render(<SignupScreen onSubmit={() => {}} loading />);
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
  });

  it('calls onLoginClick when login link clicked', () => {
    const onLoginClick = jest.fn();
    render(<SignupScreen onSubmit={() => {}} onLoginClick={onLoginClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(onLoginClick).toHaveBeenCalledTimes(1);
  });

  it('shows social buttons when onGooglePress and onApplePress are provided', () => {
    render(<SignupScreen onSubmit={() => {}} onGooglePress={() => {}} onApplePress={() => {}} />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('calls onGooglePress when Continue with Google is clicked', () => {
    const onGooglePress = jest.fn();
    render(
      <SignupScreen onSubmit={() => {}} onGooglePress={onGooglePress} onApplePress={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(onGooglePress).toHaveBeenCalledTimes(1);
  });

  it('calls onApplePress when Continue with Apple is clicked', () => {
    const onApplePress = jest.fn();
    render(
      <SignupScreen onSubmit={() => {}} onGooglePress={() => {}} onApplePress={onApplePress} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Apple' }));
    expect(onApplePress).toHaveBeenCalledTimes(1);
  });
});
