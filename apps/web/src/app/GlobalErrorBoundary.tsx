'use client';

import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GlobalErrorBoundary', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ maxWidth: 480, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            We ran into an error. Refresh the page or try again later.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 8,
              border: 'none',
              background: 'var(--groupfit-secondary)',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: '2rem' }}>
            <a href="/login" style={{ color: 'var(--groupfit-grey)', fontSize: 14 }}>
              ← Back to login
            </a>
          </p>
        </main>
      );
    }
    return this.props.children;
  }
}
