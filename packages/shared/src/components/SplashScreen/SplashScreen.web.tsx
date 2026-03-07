import React from 'react';

export interface SplashScreenWebProps {
  title?: string;
  version?: string;
  subtitle?: string;
  loading?: boolean;
  logo?: React.ReactNode;
  className?: string;
}

export function SplashScreenWeb(props: SplashScreenWebProps) {
  const { title = 'GroupFit', version, subtitle, loading = false, logo, className = '' } = props;

  return (
    <main
      className={'gf-splash ' + className}
      role="progressbar"
      aria-busy={loading}
      aria-label="Loading"
    >
      <div className="gf-splash__inner">
        {logo != null ? (
          <div className="gf-splash__logo">{logo}</div>
        ) : (
          <h1 className="gf-splash__title">{title}</h1>
        )}
        {subtitle ? <p className="gf-splash__subtitle">{subtitle}</p> : null}
        {version ? <p className="gf-splash__version">v{version}</p> : null}
        {loading ? <div className="gf-splash__spinner" aria-hidden /> : null}
      </div>
    </main>
  );
}
