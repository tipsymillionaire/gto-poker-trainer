import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Make sure Tailwind directives are here

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GTO Poker Trainer',
  description: 'Train your preflop GTO skills vs opens.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>{children}</body>
    </html>
  );
}