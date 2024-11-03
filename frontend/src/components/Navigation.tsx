'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';

const Navigation: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Show a minimal header while auth is loading
  if (loading) {
    return (
      <nav className="header">
        <div className="container mx-auto flex justify-between items-center px-4 py-3">
          <Link href="/" className="text-white text-2xl font-bold">
            Bitcoin Document Vault
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="header">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-white text-2xl font-bold hover:text-background-dark transition-colors">
            Bitcoin Document Vault
          </Link>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex gap-4">
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

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4">
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-white py-2 hover:bg-primary-dark px-2 rounded">
                    Dashboard
                  </Link>
                  <Link href="/documents" className="text-white py-2 hover:bg-primary-dark px-2 rounded">
                    Documents
                  </Link>
                  <Link href="/wallet" className="text-white py-2 hover:bg-primary-dark px-2 rounded">
                    Wallet
                  </Link>
                  <Link href="/profile" className="text-white py-2 hover:bg-primary-dark px-2 rounded">
                    Profile
                  </Link>
                  <button 
                    onClick={signOut} 
                    className="text-white py-2 hover:bg-primary-dark px-2 rounded text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-white py-2 hover:bg-primary-dark px-2 rounded">
                    Login
                  </Link>
                  <Link href="/register" className="text-white py-2 hover:bg-primary-dark px-2 rounded">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;