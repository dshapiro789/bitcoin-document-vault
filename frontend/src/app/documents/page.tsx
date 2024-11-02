'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DocumentUpload from '../../components/DocumentUpload';

interface Document {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  category: string;
  timelock?: string;
  contractAddress?: string;
}

const DocumentsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Document>('fileName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'text' | 'unsupported' | 'error' | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchDocuments();
      }
    }
  }, [user, router, loading]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }
      const data = await response.json();
      setDocuments(data);
      const uniqueCategories = [...new Set(data.map((doc: Document) => doc.category))].filter((category): category is string => category !== undefined);
      setCategories(['All', ...uniqueCategories]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentIds: selectedDocuments }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete documents: ${response.statusText}`);
      }
      
      await fetchDocuments();
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Error deleting documents:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete documents');
    }
  };

  const handleBulkUpdateCategory = async (newCategory: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/bulk-update-category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          documentIds: selectedDocuments,
          category: newCategory 
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to update categories: ${response.statusText}`);
      }

      await fetchDocuments();
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Error updating categories:', error);
      setError(error instanceof Error ? error.message : 'Failed to update categories');
    }
  };

  const updateCategory = async (id: string, newCategory: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${id}/category`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: newCategory }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update category: ${response.statusText}`);
      }
      
      await fetchDocuments();
      if (!categories.includes(newCategory)) {
        setCategories([...categories, newCategory]);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      setError(error instanceof Error ? error.message : 'Failed to update category');
    }
  };

  const addNewCategory = (docId?: string) => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName)) {
      const newCategory = newCategoryName.trim();
      setCategories([...categories, newCategory]);
      if (docId) {
        updateCategory(docId, newCategory);
      } else {
        setSelectedCategory(newCategory);
      }
      setNewCategoryName('');
      setIsAddingNewCategory(false);
    }
  };

  const previewDocument = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${id}/preview`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to preview document: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      
      if (!contentType) {
        throw new Error('No content type received from server');
      }

      if (contentType.startsWith('image/')) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewType('image');
      } else if (contentType === 'application/pdf') {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewType('pdf');
      } else if (contentType.startsWith('text/') || contentType === 'application/json') {
        const text = await response.text();
        setPreviewUrl(text);
        setPreviewType('text');
      } else {
        setPreviewUrl('Unsupported file type for preview');
        setPreviewType('unsupported');
      }
    } catch (error) {
      console.error('Error previewing document:', error);
      setPreviewUrl(error instanceof Error ? error.message : 'Error loading preview');
      setPreviewType('error');
    }
  };

  const downloadDocument = async (id: string, fileName: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${id}/download`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download document: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError(error instanceof Error ? error.message : 'Failed to download document');
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/files/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`);
      }
      
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete document');
    }
  };

  const createTimeLock = async (id: string, unlockDate: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}/timelock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unlockDate }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create time lock: ${response.statusText}`);
      }
      
      await fetchDocuments();
    } catch (error) {
      console.error('Error creating time lock:', error);
      setError(error instanceof Error ? error.message : 'Failed to create time lock');
    }
  };

  const unlockDocument = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}/unlock`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to unlock document: ${response.statusText}`);
      }
      
      await fetchDocuments();
    } catch (error) {
      console.error('Error unlocking document:', error);
      setError(error instanceof Error ? error.message : 'Failed to unlock document');
    }
  };

  const handleSelectDocument = (id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]
    );
  };

  const filteredDocuments = documents
    .filter(doc => selectedCategory === 'All' || doc.category === selectedCategory)
    .filter(doc => doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()));

  const sortedDocuments = filteredDocuments.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const pageCount = Math.ceil(sortedDocuments.length / itemsPerPage);
  const paginatedDocuments = sortedDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-orange"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}

<DocumentUpload onUploadComplete={fetchDocuments} />

<div className="mb-4 flex flex-wrap gap-4">
  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
    className="border rounded p-2"
  >
    {categories.map(category => (
      <option key={category} value={category}>{category}</option>
    ))}
  </select>

  <input
    type="text"
    placeholder="Search documents..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="border rounded p-2"
  />

  <select
    value={sortField}
    onChange={(e) => setSortField(e.target.value as keyof Document)}
    className="border rounded p-2"
  >
    <option value="fileName">File Name</option>
    <option value="uploadDate">Upload Date</option>
    <option value="fileSize">File Size</option>
    <option value="category">Category</option>
  </select>

  <button
    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
    className="bg-primary-orange text-white px-4 py-2 rounded hover:bg-orange-600"
  >
    {sortDirection === 'asc' ? '↑' : '↓'}
  </button>
</div>

<div className="bg-white rounded-lg shadow p-6">
  {isLoading ? (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-orange"></div>
    </div>
  ) : (
    <>
      {selectedDocuments.length > 0 && (
        <div className="mb-4">
          <button 
            onClick={handleBulkDelete}
            className="bg-primary-orange text-white px-2 py-1 rounded hover:bg-orange-600 mr-2"
          >
            Delete Selected
          </button>
          <select
            onChange={(e) => handleBulkUpdateCategory(e.target.value)}
            className="border rounded p-1"
          >
            <option value="">Update Category</option>
            {categories.filter(cat => cat !== 'All').map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      )}

      {paginatedDocuments.length > 0 ? (
        <>
          <ul className="divide-y divide-gray-200">
            {paginatedDocuments.map((doc: Document) => (
              <li key={doc._id} className="py-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc._id)}
                    onChange={() => handleSelectDocument(doc._id)}
                    className="h-4 w-4 text-primary-orange"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.fileName}
                    </p>
                    <p className="text-sm text-gray-500">{doc.fileType}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded: {new Date(doc.uploadDate).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Category: {doc.category}
                    </p>
                  </div>
                  <div className="inline-flex items-center text-base font-semibold text-gray-900">
                    {(doc.fileSize / 1024).toFixed(2)} KB
                  </div>

                  <select 
                    value={isAddingNewCategory ? 'new' : doc.category} 
                    onChange={(e) => {
                      if (e.target.value === 'new') {
                        setIsAddingNewCategory(true);
                        setNewCategoryName('');
                      } else {
                        updateCategory(doc._id, e.target.value);
                        setIsAddingNewCategory(false);
                      }
                    }}
                    className="border rounded p-1"
                  >
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="new">+ New Category</option>
                  </select>

                  {isAddingNewCategory && (
                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        className="border rounded p-1 mr-2"
                      />
                      <button
                        onClick={() => addNewCategory(doc._id)}
                        className="bg-primary-orange text-white px-2 py-1 rounded hover:bg-orange-600"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => previewDocument(doc._id)}
                      className="bg-primary-orange text-white px-2 py-1 rounded hover:bg-orange-600"
                    >
                      Preview
                    </button>
                    <button 
                      onClick={() => downloadDocument(doc._id, doc.fileName)}
                      className="bg-primary-orange text-white px-2 py-1 rounded hover:bg-orange-600"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => deleteDocument(doc._id)}
                      className="bg-primary-orange text-white px-2 py-1 rounded hover:bg-orange-600"
                    >
                      Delete
                    </button>

                    {!doc.timelock && (
                            <button
                              onClick={() => {
                                const date = prompt('Enter unlock date (YYYY-MM-DD):');
                                if (date) createTimeLock(doc._id, date);
                              }}
                              className="bg-primary-orange text-white px-2 py-1 rounded hover:bg-orange-600"
                            >
                              Time Lock
                            </button>
                          )}
                          {doc.timelock && (
                            <>
                              <button
                                onClick={() => unlockDocument(doc._id)}
                                className="bg-primary-orange text-white px-2 py-1 rounded hover:bg-orange-600"
                              >
                                Unlock
                              </button>
                              <span className="text-sm text-gray-500">
                                Locked until: {new Date(doc.timelock).toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-center">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`mx-1 px-3 py-1 rounded ${
                        currentPage === page 
                          ? 'bg-primary-orange text-white' 
                          : 'bg-gray-200 hover:bg-orange-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">No documents found.</p>
            )}
          </>
        )}
      </div>

      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-3xl max-h-[90vh] overflow-auto">
            {previewType === 'image' && (
              <img 
                src={previewUrl} 
                alt="Document preview" 
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}
            {previewType === 'pdf' && (
              <iframe 
                src={previewUrl} 
                title="PDF preview" 
                className="w-full h-[70vh]"
              />
            )}
            {previewType === 'text' && (
              <pre className="whitespace-pre-wrap overflow-auto max-h-[70vh] p-4">
                {previewUrl}
              </pre>
            )}
            {previewType === 'unsupported' && (
              <p className="text-gray-700">This file type is not supported for preview.</p>
            )}
            {previewType === 'error' && (
              <p className="text-red-600">Error loading preview: {previewUrl}</p>
            )}
            <button 
              onClick={() => {
                setPreviewUrl(null);
                setPreviewType(null);
              }}
              className="mt-4 bg-primary-orange text-white px-4 py-2 rounded hover:bg-orange-600 w-full"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;



