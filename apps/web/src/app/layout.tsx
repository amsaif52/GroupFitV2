import type { Metadata } from 'next';
import './globals.css';
import './auth.css';
import { TamaguiProvider } from './TamaguiProvider';
import { QueryProvider } from './QueryProvider';

export const metadata: Metadata = {
  title: 'GroupFit',
  description: 'Fitness platform for admins, trainers, and customers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <TamaguiProvider>{children}</TamaguiProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
