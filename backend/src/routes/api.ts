import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { login, logout, authenticateUser, register } from '../controllers/authController';
import { FileController } from '../controllers/fileController';
import { generateWallet } from '../utils/bitcoin';
import { createUser, IUser } from '../models/User';
import { ProfileController } from '../controllers/profileController';
import { WalletService } from '../services/walletService';
import { WalletController } from '../controllers/walletController';
import { RequestWithUser } from '../types/express';
import { User } from '../models/User';
import { comparePassphrase, hashPassphrase } from '../utils/crypto';
import { checkSupabaseConnection } from '../services/supabaseService';

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, TXT, and DOCX files are allowed.'));
  }
};

// Set up multer with file size limit (10MB) and file filter
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

// Public routes
router.post('/register', (req: Request, res: Response, next) => {
  console.log('Register route hit:', req.body);
  register(req, res, next);
});

router.post('/login', login);
router.post('/logout', logout);

// Supabase status check route (public)
router.get('/supabase-status', async (req: Request, res: Response) => {
  const isConnected = await checkSupabaseConnection();
  res.json({ connected: isConnected });
});

// Protected routes
router.use(authenticateUser);

// File routes
router.post('/upload', upload.single('file'), FileController.uploadFile);
router.get('/files', FileController.getFiles);
router.delete('/files/:id', FileController.deleteFile);
router.put('/files/:id/category', FileController.updateCategory);
router.get('/files/:id/download', FileController.downloadFile);
router.get('/files/:id/preview', FileController.previewFile);
router.post('/files/bulk-delete', FileController.bulkDelete);
router.post('/files/bulk-update-category', FileController.bulkUpdateCategory);
router.get('/storage-info', FileController.getStorageInfo);

// Profile routes
router.get('/profile', ProfileController.getProfile);
router.post('/change-passphrase', ProfileController.changePassphrase);
router.delete('/delete-account', ProfileController.deleteAccount);
router.get('/export-data', ProfileController.exportData);
router.put('/profile/theme', ProfileController.updateTheme);

// Wallet routes
router.get('/wallet/info', WalletController.getWalletInfo);
router.post('/wallet/new-address', WalletController.generateNewAddress);
router.post('/wallet/send', WalletController.sendTransaction);
router.get('/wallet/node-status', WalletController.getNodeStatus);
router.post('/wallet/connect-node', WalletController.connectToNode);

// Document smart contract routes
router.post('/documents/:id/timelock', FileController.createTimeLock);
router.post('/documents/:id/unlock', FileController.unlockDocument);

// Authentication check route
router.get('/auth/check', (req: Request, res: Response) => {
  if ((req as any).user) {
    res.json((req as any).user);
  } else {
    res.status(401).json({ error: 'User not authenticated' });
  }
});

export default router;