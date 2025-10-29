import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

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
  themeColor: '#0E1535',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
