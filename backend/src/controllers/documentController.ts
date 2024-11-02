import { Request, Response } from 'express';
import { IDocument, DocumentModel } from '../models/Document'; // Assuming you have a Document model
import { AuthenticatedRequest } from '../types';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { title, encrypted_content, salt, iv } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const newDocument: IDocument = new DocumentModel({
      user_id: userId,
      title,
      encrypted_content,
      salt,
      iv
    });

    const savedDocument = await newDocument.save();

    res.status(201).json(savedDocument);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const documents = await DocumentModel.find({ user_id: userId });

    res.status(200).json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};