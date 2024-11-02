import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface DocumentUploadProps {
  onUploadComplete: () => Promise<void>;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('Uncategorized');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        setFile(null);
      } else {
        setFile(selectedFile);
        setError(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      console.log('Uploading file:', file.name);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data);
      onUploadComplete();
      setFile(null);
      setCategory('Uncategorized');
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-orange file:text-white hover:file:bg-orange-600"
          accept=".jpg,.jpeg,.png,.pdf,.txt,.docx"
        />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="border rounded p-2"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="py-2 px-4 bg-primary-orange text-white rounded-full text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <p className="text-sm text-gray-600">
        Max file size: 10MB. Allowed file types: JPEG, PNG, PDF, TXT, DOCX.
      </p>
    </div>
  );
};

export default DocumentUpload;