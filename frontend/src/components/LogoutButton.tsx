import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const LogoutButton: React.FC = () => {
  const { signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout} 
      disabled={isLoading}
      className="btn-primary"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
};

export default LogoutButton;