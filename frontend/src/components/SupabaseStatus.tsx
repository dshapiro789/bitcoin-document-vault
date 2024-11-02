import React, { useState, useEffect } from 'react';

const SupabaseStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/supabase-status`, {
          credentials: 'include'
        });
        const data = await response.json();
        setIsConnected(data.connected);
      } catch (error) {
        console.error('Error checking Supabase connection:', error);
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="flex items-center">
      <span className="mr-2">Supabase Status:</span>
      {isConnected === null ? (
        <span className="text-gray-500">Checking...</span>
      ) : isConnected ? (
        <span className="text-green-500">Connected</span>
      ) : (
        <span className="text-red-500">Disconnected</span>
      )}
    </div>
  );
};

export default SupabaseStatus;