import type { Metadata } from 'next';
import CityBootstrap from '@/components/ui/CityBootstrap';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: { default: 'Rydo — Ride Together, Save More', template: '%s | Rydo' },
  description: 'Share rides across India. Rydo connects drivers and passengers for affordable, comfortable travel — city to city.',
  keywords: ['ride sharing', 'carpooling', 'rydo', 'city rides', 'travel'],
  openGraph: {
    title: 'Rydo — Smarter City Rides',
    description: 'Share rides, split costs, travel smarter.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AuthProvider>
          <QueryProvider>
            <CityBootstrap />
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1E1E1E',
                  color: '#F5F5F5',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#FF6D00', secondary: '#0D0D0D' } },
                error:   { iconTheme: { primary: '#EF4444', secondary: '#0A0A0A' } },
              }}
            />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
