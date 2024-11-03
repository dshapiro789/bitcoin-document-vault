'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [mnemonic, setMnemonic] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { signIn, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="card max-w-md mx-auto mt-10 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(mnemonic, passphrase);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred during login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="card max-w-md mx-auto mt-10">
          <h2 className="text-3xl font-bold mb-6 text-primary">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-primary">Mnemonic:</label>
              <input
                type="text"
                value={mnemonic}
                onChange={(e) => setMnemonic(e.target.value)}
                className="w-full p-3 border-2 border-primary rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="Enter your mnemonic phrase"
              />
            </div>
            <div>
              <label className="block mb-2 text-primary">Passphrase:</label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full p-3 border-2 border-primary rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="Enter your passphrase"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Login
            </button>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;