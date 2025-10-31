import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'PSW Voice Documentation System | Tailored Care Solutions',
  description:
    'Enterprise-grade voice-powered documentation system for Personal Support Workers with AI assistance, HIPAA 2025 compliance, and real-time health monitoring.',
  keywords: [
    'PSW',
    'Personal Support Worker',
    'healthcare documentation',
    'voice recognition',
    'AI assistant',
    'HIPAA compliant',
    'Tailored Care Solutions',
    'shift reports',
  ],
  authors: [{ name: 'Tailored Care Solutions' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1B365D', // Tailored Care Solutions Blue
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
