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
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('calls onSubmit with email and password on submit', async () => {
    const onSubmit = jest.fn();
    render(<LoginScreen onSubmit={onSubmit} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
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
});
