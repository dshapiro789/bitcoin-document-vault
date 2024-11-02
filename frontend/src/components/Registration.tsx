'use client';

import React, { useState } from 'react';
import { generateMnemonic } from 'bip39';
import { useAuth } from '../contexts/AuthContext';
import Link from 'next/link';

const Registration: React.FC = () => {
  const [passphrase, setPassphrase] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registeredMnemonic, setRegisteredMnemonic] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();

  const generateMnemonicPhrase = () => {
    const mnemonic = generateMnemonic();
    setGeneratedMnemonic(mnemonic);
  };

  const validatePassphrase = (pass: string) => {
    const minLength = 12;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    if (pass.length < minLength) {
      return "Passphrase must be at least 12 characters long";
    }
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return "Passphrase must include uppercase, lowercase, numbers, and special characters";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (!generatedMnemonic) {
        throw new Error("Please generate a mnemonic phrase first.");
      }

      if (!passphrase) {
        throw new Error("Please enter a passphrase.");
      }

      const passphraseError = validatePassphrase(passphrase);
      if (passphraseError) {
        throw new Error(passphraseError);
      }

      console.log('Starting registration process...');
      await signUp(generatedMnemonic, passphrase);
      console.log('Registration successful');

      setSuccess("Registration successful! Please proceed to login.");
      setRegisteredMnemonic(generatedMnemonic);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : "An error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-orange-500">Register</h2>
      {!success ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-orange-500">Generated Mnemonic:</label>
            <input
              type="text"
              value={generatedMnemonic}
              readOnly
              className="w-full p-2 border border-orange-300 rounded bg-gray-100"
            />
            <button
              type="button"
              onClick={generateMnemonicPhrase}
              className="mt-2 p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-300"
            >
              Generate New Mnemonic
            </button>
          </div>
          <div>
            <label className="block mb-1 text-orange-500">Passphrase:</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full p-2 border border-orange-300 rounded bg-white"
              required
            />
            <p className="text-sm text-gray-600 mt-1">
              Passphrase must be at least 12 characters long and include uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-300 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <p className="text-green-500 mb-4">{success}</p>
          <div className="bg-orange-50 p-4 rounded border border-orange-300 mb-4">
            <h3 className="text-lg font-semibold text-orange-500 mb-2">Your Registered Mnemonic:</h3>
            <p className="break-words">{registeredMnemonic}</p>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Please store this mnemonic securely. You will need it to log in along with your passphrase.
          </p>
          <Link href="/login" className="inline-block w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-300 text-center">
            Go to Login
          </Link>
        </div>
      )}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};

export default Registration;