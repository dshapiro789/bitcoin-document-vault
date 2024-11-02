import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';
import { comparePassphrase, hashPassphrase } from '../utils/crypto';
import { WalletService } from '../services/walletService';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Processing registration request');
    const { mnemonic, passphrase } = req.body;

    if (!mnemonic || !passphrase) {
      return res.status(400).json({ error: 'Mnemonic and passphrase are required' });
    }

    // Create wallet
    const walletService = new WalletService();
    const wallet = await walletService.createWallet(mnemonic, passphrase);

    // Hash the passphrase
    const hashedPassphrase = await hashPassphrase(passphrase);

    // Check if user already exists with this fingerprint
    const existingUser = await User.findOne({ fingerprint: wallet.fingerprint });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = new User({
      mnemonic: mnemonic,
      passphrase: hashedPassphrase,
      bitcoinAddress: wallet.address,
      publicKey: wallet.publicKey,
      fingerprint: wallet.fingerprint
    });

    await user.save();

    // Set session
    (req.session as any).user = { id: user.fingerprint };

    res.status(201).json({
      message: 'Registration successful',
      id: user.fingerprint
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { mnemonic, passphrase } = req.body;

    if (!mnemonic || !passphrase) {
      return res.status(400).json({ error: 'Mnemonic and passphrase are required' });
    }

    const walletService = new WalletService();
    const fingerprint = walletService.generateFingerprint(mnemonic, passphrase);

    const user = await User.findOne({ fingerprint });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassphrase = await comparePassphrase(passphrase, user.passphrase);

    if (!isValidPassphrase) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set user session
    (req.session as any).user = { id: user.fingerprint };
    
    res.json({ id: user.fingerprint });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
};

export const logout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  if ((req.session as any).user) {
    (req as any).user = (req.session as any).user;
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Add a helper function to check authentication status
export const checkAuth = (req: Request, res: Response) => {
  if ((req.session as any).user) {
    res.json({ 
      authenticated: true, 
      user: (req.session as any).user 
    });
  } else {
    res.json({ 
      authenticated: false 
    });
  }
};

export default {
  register,
  login,
  logout,
  authenticateUser,
  checkAuth
};