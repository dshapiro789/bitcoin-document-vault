import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import apiRoutes from './routes/api';
import { Server } from 'http';
import rateLimit from 'express-rate-limit';
import { WalletService } from './services/walletService';
import { WalletController } from './controllers/walletController';
import connectDB from './config/database';
import config from './config';

// Load environment variables
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Resolved .env path:', envPath);

if (fs.existsSync(envPath)) {
  console.log('.env file exists');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} else {
  console.log('.env file does not exist');
}

console.log('Environment variables:', process.env);

// Add this check right after loading environment variables
if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET not found in environment, using a temporary secret');
  process.env.SESSION_SECRET = 'efb1cfcdec5d34b2991f41849a582282a0c964053a95a654fe1b54b7e66255fb084b62d60d39aa40344ee629531a751af62ce68d9cdad390c2bf37f63bc3c224';
}

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize WalletService with a default node URL
const walletService = new WalletService();
WalletController.initialize(walletService);

// Connect to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

// Updated CORS configuration
app.use(cors({
  origin: [config.frontendUrl],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Extend SessionData interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
    nodeUrl?: string;
  }
}

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 24 hours
  })
}));

// Create a rate limiter for change passphrase
const changePassphraseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many passphrase change attempts, please try again later.'
});

// Apply rate limiter to change passphrase route
app.use('/api/change-passphrase', changePassphraseLimiter);

// Pass walletService to your routes
app.use('/api', (req, res, next) => {
  (req as any).walletService = walletService;
  next();
}, apiRoutes);

// Add this code near the top of your server startup code to ensure the directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Global error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Add a health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Catch-all route for undefined routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;