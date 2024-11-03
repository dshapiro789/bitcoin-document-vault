'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <nav className="header">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        <Link href="/" className="text-white text-2xl font-bold hover:text-background-dark transition-colors">
          Bitcoin Document Vault
        </Link>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="btn-nav">
                Dashboard
              </Link>
              <Link href="/documents" className="btn-nav">
                Documents
              </Link>
              <Link href="/wallet" className="btn-nav">
                Wallet
              </Link>
              <Link href="/profile" className="btn-nav">
                Profile
              </Link>
              <button onClick={signOut} className="btn-nav">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-white px-6 py-2 rounded-lg hover:bg-white hover:text-primary transition-colors">
                Login
              </Link>
              <Link href="/register" className="text-white px-6 py-2 rounded-lg hover:bg-white hover:text-primary transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;