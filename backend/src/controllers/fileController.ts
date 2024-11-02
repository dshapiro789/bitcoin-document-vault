import { Request, Response } from 'express';
import { DocumentModel, IDocument } from '../models/Document';
import fs from 'fs';
import path from 'path';
import { SmartContractService } from '../services/smartContractService';
import { WalletService } from '../services/walletService';
import { supabase } from '../services/supabaseService';

const walletService = new WalletService();

export const FileController = {
  uploadFile: async (req: Request, res: Response) => {
    console.log('FileController.uploadFile called');
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      const fileBuffer = req.file.buffer;
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('encrypted-documents')
        .upload(filePath, fileBuffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('encrypted-documents')
        .getPublicUrl(filePath);

      if (!urlData) {
        throw new Error('Failed to get public URL');
      }

      const publicURL = urlData.publicUrl;

      const newDocument: IDocument = new DocumentModel({
        userId: (req as any).user.id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        path: filePath,
        publicUrl: publicURL,
        category: req.body.category || 'Uncategorized',
        hash: await walletService.hashDocument(fileBuffer),
      });

      await newDocument.save();
      console.log('Document saved:', newDocument);

      res.status(201).json({ message: 'File uploaded successfully', document: newDocument });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'File upload failed', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  getFiles: async (req: Request, res: Response) => {
    try {
      const userFingerprint = (req as any).user.id;
      const documents = await DocumentModel.find({ userId: userFingerprint });
      console.log('Documents fetched:', documents.length);
      res.json(documents);
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  },

  deleteFile: async (req: Request, res: Response) => {
    try {
      const document = await DocumentModel.findOneAndDelete({
        _id: req.params.id,
        userId: (req as any).user.id,
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete the file from Supabase storage
      const { error } = await supabase.storage
        .from('encrypted-documents')
        .remove([document.path]);

      if (error) {
        throw error;
      }

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'Failed to delete file' });
    }
  },

  updateCategory: async (req: Request, res: Response) => {
    try {
      const document = await DocumentModel.findOneAndUpdate(
        { _id: req.params.id, userId: (req as any).user.id },
        { category: req.body.category },
        { new: true }
      );

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json(document);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  },

  downloadFile: async (req: Request, res: Response) => {
    try {
      const document = await DocumentModel.findOne({
        _id: req.params.id,
        userId: (req as any).user.id,
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const { data, error } = await supabase.storage
        .from('encrypted-documents')
        .download(document.path);

      if (error) {
        throw error;
      }

      res.setHeader('Content-Type', document.fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
      res.send(data);
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ error: 'Failed to download file' });
    }
  },

  previewFile: async (req: Request, res: Response) => {
    try {
      const document = await DocumentModel.findOne({
        _id: req.params.id,
        userId: (req as any).user.id,
      });

      if (!document) {
        console.log('Document not found');
        return res.status(404).json({ error: 'Document not found' });
      }

      const { data, error } = await supabase.storage
        .from('encrypted-documents')
        .download(document.path);

      if (error) {
        throw error;
      }

      console.log('File type:', document.fileType);

      if (document.fileType.startsWith('image/')) {
        console.log('Sending image file');
        res.setHeader('Content-Type', document.fileType);
        return res.send(data);
      } 
      
      if (document.fileType === 'application/pdf') {
        console.log('Sending PDF file');
        res.setHeader('Content-Type', 'application/pdf');
        return res.send(data);
      }

      if (document.fileType.startsWith('text/') || document.fileType === 'application/json') {
        console.log('Sending text file');
        const fileContent = data.toString(); // Remove 'utf-8' argument
        return res.json({ content: fileContent });
      }

      // For other file types
      console.log('Unsupported file type for preview');
      res.status(400).json({ error: 'Preview not available for this file type' });
    } catch (error) {
      console.error('Error previewing file:', error);
      res.status(500).json({ error: 'Failed to preview file' });
    }
  },

  bulkDelete: async (req: Request, res: Response) => {
    try {
      const { ids } = req.body;
      const deletedDocuments = await DocumentModel.find({
        _id: { $in: ids },
        userId: (req as any).user.id,
      });

      await DocumentModel.deleteMany({
        _id: { $in: ids },
        userId: (req as any).user.id,
      });

      // Delete files from Supabase storage
      for (const doc of deletedDocuments) {
        const { error } = await supabase.storage
          .from('encrypted-documents')
          .remove([doc.path]);

        if (error) {
          console.error('Error deleting file from storage:', error);
        }
      }

      res.json({ message: 'Documents deleted successfully' });
    } catch (error) {
      console.error('Error deleting files:', error);
      res.status(500).json({ error: 'Failed to delete files' });
    }
  },

  bulkUpdateCategory: async (req: Request, res: Response) => {
    try {
      const { ids, category } = req.body;
      await DocumentModel.updateMany(
        { _id: { $in: ids }, userId: (req as any).user.id },
        { category }
      );

      res.json({ message: 'Categories updated successfully' });
    } catch (error) {
      console.error('Error updating categories:', error);
      res.status(500).json({ error: 'Failed to update categories' });
    }
  },

  getStorageInfo: async (req: Request, res: Response) => {
    try {
      const documents = await DocumentModel.find({ userId: (req as any).user.id });
      const totalStorage = 1000 * 1024 * 1024; // 1000 MB in bytes
      const usedStorage = documents.reduce((total, doc) => total + doc.fileSize, 0);

      res.json({
        totalStorage,
        usedStorage,
      });
    } catch (error) {
      console.error('Error fetching storage info:', error);
      res.status(500).json({ error: 'Failed to fetch storage info' });
    }
  },

  createTimeLock: async (req: Request, res: Response) => {
    try {
      const { documentId, unlockTime } = req.body;
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const walletService = new WalletService();
      const smartContractService = new SmartContractService(walletService);

      const contractAddress = await smartContractService.createTimeLockContract(
        document.hash,
        unlockTime,
        (req as any).user.bitcoinAddress
      );

      document.contractAddress = contractAddress;
      document.unlockTime = new Date(unlockTime * 1000);
      await document.save();

      res.json({ message: 'Time lock created successfully', contractAddress });
    } catch (error) {
      console.error('Error creating time lock:', error);
      res.status(500).json({ error: 'Failed to create time lock' });
    }
  },

  unlockDocument: async (req: Request, res: Response) => {
    try {
      const { documentId } = req.params;
      const document = await DocumentModel.findById(documentId);
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (!document.contractAddress || !document.unlockTime) {
        return res.status(400).json({ error: 'Document is not time-locked' });
      }

      const now = new Date();
      if (now < document.unlockTime) {
        return res.status(403).json({ error: 'Document is still locked' });
      }

      const walletService = new WalletService();
      const smartContractService = new SmartContractService(walletService);

      const isUnlocked = await smartContractService.unlockTimeLockContract(
        document.contractAddress,
        (req as any).user.privateKey,
        Buffer.from(document.redeemScript || '', 'hex')
      );

      if (isUnlocked) {
        document.contractAddress = undefined;
        document.unlockTime = undefined;
        document.redeemScript = undefined;
        await document.save();
        res.json({ message: 'Document unlocked successfully' });
      } else {
        res.status(500).json({ error: 'Failed to unlock document' });
      }
    } catch (error) {
      console.error('Error unlocking document:', error);
      res.status(500).json({ error: 'Failed to unlock document' });
    }
  }
};