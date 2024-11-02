import React from 'react';
import { Document } from '../types';

interface DocumentListProps {
  documents: Document[];
  searchTerm: string;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, searchTerm }) => {
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {filteredDocuments.map((doc) => (
        <div key={doc.id} className="mb-4 p-4 bg-white rounded shadow">
          <h3 className="text-lg font-semibold">{doc.title}</h3>
          <p className="text-sm text-gray-500">Created: {new Date(doc.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;