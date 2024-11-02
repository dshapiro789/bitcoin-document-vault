'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-primary-orange mb-6">User Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p><strong>User ID:</strong> {user.id}</p>
        {/* Add more user details here if needed */}
      </div>
    </div>
  );
};

export default ProfilePage;