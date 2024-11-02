'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiFile, FiPieChart } from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import SupabaseStatus from '../../components/SupabaseStatus';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Document {
  _id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  category: string;
}

interface StorageInfo {
  totalStorage: number;
  usedStorage: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ totalStorage: 1000 * 1024 * 1024, usedStorage: 0 });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else {
      fetchDocuments();
      fetchStorageInfo();
    }
  }, [user, router]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchStorageInfo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/storage-info`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStorageInfo(data);
      } else {
        console.error('Failed to fetch storage info');
      }
    } catch (error) {
      console.error('Error fetching storage info:', error);
    }
  };

  if (!user) {
    return null;
  }

  const usedStorageMB = Math.round(storageInfo.usedStorage / (1024 * 1024));
  const totalStorageMB = Math.round(storageInfo.totalStorage / (1024 * 1024));

  const storageData = {
    labels: ['Used', 'Available'],
    datasets: [
      {
        data: [usedStorageMB, totalStorageMB - usedStorageMB],
        backgroundColor: ['#FF6600', '#E0E0E0'],
        hoverBackgroundColor: ['#FF8033', '#EEEEEE'],
      },
    ],
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 mt-0"
    >
      <h1 className="text-4xl font-bold text-primary-orange mb-6">Dashboard</h1>
      
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white shadow-md rounded-lg p-6 mb-6"
      >
        <h2 className="text-2xl font-bold text-primary-orange mb-4">System Status</h2>
        <SupabaseStatus />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="bg-white shadow-md rounded-lg p-6"
        >
          <h2 className="text-2xl font-bold text-primary-orange mb-4">Storage Usage</h2>
          <div className="flex items-center justify-center">
            <div className="w-32 h-32">
              <Doughnut data={storageData} options={{ cutout: '70%' }} />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold">{usedStorageMB} MB / {totalStorageMB} MB</p>
              <p className="text-sm text-gray-500">Used Storage</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold text-primary-orange mb-4 flex items-center">
          <FiFile className="mr-2" /> Your Recent Documents
        </h2>
        {documents.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {documents.slice(0, 5).map((doc: Document) => (
              <motion.li 
                key={doc._id} 
                className="py-4 hover:bg-gray-50 transition duration-150 ease-in-out"
                whileHover={{ x: 10 }}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">{doc.fileType} • Uploaded: {new Date(doc.uploadDate).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Category: {doc.category}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-dark-gray">You haven't uploaded any documents yet.</p>
        )}
        <Link href="/documents" className="mt-4 inline-block text-primary-orange hover:underline flex items-center">
          <FiPieChart className="mr-2" /> Manage all documents
        </Link>
      </motion.div>
    </motion.main>
  );
};

export default Dashboard;