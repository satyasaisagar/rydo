import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/providers/QueryProvider';
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata: Metadata = {
  title: { default: 'Rydo — Smarter City Rides', template: '%s | Rydo' },
  description: 'Share rides, split costs, travel smarter. Rydo connects drivers and passengers for affordable, comfortable city travel.',
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
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1A1A1A',
                  color: '#F5F5F5',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#00C853', secondary: '#0A0A0A' } },
                error:   { iconTheme: { primary: '#EF4444', secondary: '#0A0A0A' } },
              }}
            />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
