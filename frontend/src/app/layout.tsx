'use client';

import { AuthProvider } from '../contexts/AuthContext';
import Navigation from '../components/Navigation';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          <main className="container mx-auto px-4 py-8 mt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}