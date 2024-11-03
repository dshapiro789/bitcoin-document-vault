'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Get API URL from environment or fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

interface User {
  id: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (mnemonic: string, passphrase: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (mnemonic: string, passphrase: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!API_URL) {
        setError('API URL not configured');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/check`, {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setError('Unable to connect to server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (mnemonic: string, passphrase: string) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mnemonic, passphrase }),
        credentials: 'include',
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signUp = async (mnemonic: string, passphrase: string) => {
    try {
      console.log('Attempting to connect to:', `${API_URL}/api/register`);
      
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ mnemonic, passphrase }),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check if the backend is running on port 3001.');
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
      {loading ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
          </div>
        </div>
      ) : error ? (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-red-500 text-center p-4">
            {error}
            <br />
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-primary text-white px-4 py-2 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};