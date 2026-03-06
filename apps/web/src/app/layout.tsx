import type { Metadata } from 'next';
import './globals.css';
import './auth.css';
import { TamaguiProvider } from './TamaguiProvider';
import { QueryProvider } from './QueryProvider';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import { DefaultLocationProvider } from '@/contexts/DefaultLocationContext';

export const metadata: Metadata = {
  title: 'GroupFit',
  description: 'Fitness platform for admins, trainers, and customers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalErrorBoundary>
          <QueryProvider>
            <TamaguiProvider>
              <DefaultLocationProvider>{children}</DefaultLocationProvider>
            </TamaguiProvider>
          </QueryProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
