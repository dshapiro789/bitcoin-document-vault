import { Request, Response } from 'express';
import { User } from '../models/User';
import { DocumentModel } from '../models/Document';
import { WalletService } from '../services/walletService';
import { hashPassphrase, comparePassphrase } from '../utils/crypto'; // Add comparePassphrase import

const checkPasswordStrength = (password: string): boolean => {
  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

export const ProfileController = {
  getProfile: async (req: Request, res: Response) => {
    try {
      const user = await User.findById((req as any).user._id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        bitcoinAddress: user.bitcoinAddress,
        publicKey: user.publicKey,
        theme: user.theme
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  changePassphrase: async (req: Request, res: Response) => {
    try {
      const { currentPassphrase, newPassphrase } = req.body;
      const userId = (req as any).user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Verify current passphrase
      const isValidPassphrase = await comparePassphrase(currentPassphrase, user.passphrase);
      if (!isValidPassphrase) {
        return res.status(401).json({ error: 'Invalid current passphrase' });
      }

      // Hash the new passphrase
      const hashedNewPassphrase = await hashPassphrase(newPassphrase);

      // Generate a new wallet with the new passphrase
      const walletService = new WalletService();
      const newWallet = await walletService.createWallet(user.mnemonic, newPassphrase);

      // Update user information
      user.passphrase = hashedNewPassphrase;
      user.bitcoinAddress = newWallet.address || user.bitcoinAddress; // Provide a fallback
      user.publicKey = newWallet.publicKey;
      user.fingerprint = newWallet.fingerprint;

      await user.save();

      res.json({ message: 'Passphrase changed successfully' });
    } catch (error) {
      console.error('Error changing passphrase:', error);
      res.status(500).json({ error: 'Failed to change passphrase' });
    }
  },

  deleteAccount: async (req: Request, res: Response) => {
    try {
      await User.findByIdAndDelete((req as any).user._id);
      await DocumentModel.deleteMany({ userId: (req as any).user._id });
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete account' });
    }
  },

  exportData: async (req: Request, res: Response) => {
    try {
      const user = await User.findById((req as any).user._id);
      const documents = await DocumentModel.find({ userId: (req as any).user._id });
      const exportData = {
        user: {
          bitcoinAddress: user?.bitcoinAddress,
          publicKey: user?.publicKey
        },
        documents: documents.map(doc => ({
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          uploadDate: doc.uploadDate,
          category: doc.category
        }))
      };
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export data' });
    }
  },

  updateTheme: async (req: Request, res: Response) => {
    try {
      const { theme } = req.body;
      if (theme !== 'light' && theme !== 'dark') {
        return res.status(400).json({ error: 'Invalid theme' });
      }

      const user = await User.findByIdAndUpdate(
        (req as any).user._id,
        { theme },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ theme: user.theme });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update theme' });
    }
  }
};