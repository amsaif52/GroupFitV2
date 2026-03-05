import { render, screen, fireEvent } from '@testing-library/react';
import { SignupScreen } from '@groupfit/shared/components';

describe('SignupScreen', () => {
  it('renders title and form fields', () => {
    render(<SignupScreen onSubmit={() => {}} />);
    expect(screen.getByText('Set Up Your Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('calls onSubmit with name, email, password on submit when passwords match', () => {
    const onSubmit = jest.fn();
    render(<SignupScreen onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
    });
  });

  it('shows field error when passwords do not match', () => {
    const onSubmit = jest.fn();
    render(<SignupScreen onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
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
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
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
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'secret123',
    });
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
    render(
      <SignupScreen
        onSubmit={() => {}}
        onGooglePress={() => {}}
        onApplePress={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeInTheDocument();
    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('calls onGooglePress when Continue with Google is clicked', () => {
    const onGooglePress = jest.fn();
    render(
      <SignupScreen
        onSubmit={() => {}}
        onGooglePress={onGooglePress}
        onApplePress={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }));
    expect(onGooglePress).toHaveBeenCalledTimes(1);
  });

  it('calls onApplePress when Continue with Apple is clicked', () => {
    const onApplePress = jest.fn();
    render(
      <SignupScreen
        onSubmit={() => {}}
        onGooglePress={() => {}}
        onApplePress={onApplePress}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Continue with Apple' }));
    expect(onApplePress).toHaveBeenCalledTimes(1);
  });
});
